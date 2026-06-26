"use server";

import { isAdminEmail, isAdminUser } from "@/lib/auth/admin";
import {
  getStoredImpersonatorEmail,
  restoreAdminFromImpersonation,
} from "@/lib/admin/restore-session";
import { startViewingAsUser } from "@/lib/admin/view-as-session";
import type {
  AdminDashboardStats,
  AdminUserRow,
} from "@/lib/admin/types";
import {
  isActiveUser,
  isSignedInToday,
} from "@/lib/admin/types";
import type { UserPersona } from "@/lib/profile/persona";
import type { BillingPlanId } from "@/lib/billing/plans";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type DemoUser = {
  id: string;
  email: string;
  label: string;
  created_at: string;
  planTier: BillingPlanId;
  persona: UserPersona | null;
};

async function getRealUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function requireAdmin() {
  const user = await getRealUser();
  if (!isAdminUser(user)) throw new Error("Not authorized");
  return user!;
}

function randomDemoEmail() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `demo-${Date.now().toString(36)}-${rand}@demo.example.com`;
}

function profilePatchForDemoPlanTier(planTier: BillingPlanId) {
  if (planTier === "student") {
    return {
      is_student: true,
      student_level: "high_school" as const,
      persona: "student" as const,
      onboarding_persona_set: true,
      plan_tier: "student",
    };
  }

  return {
    is_student: false,
    student_level: null,
    persona: "professional" as const,
    onboarding_persona_set: true,
    plan_tier: planTier,
  };
}

export async function listDemoUsers(): Promise<DemoUser[]> {
  const admin = await requireAdmin();
  const svc = createServiceClient();
  const { data: demos } = await svc
    .from("demo_users")
    .select("id, email, label, created_at")
    .eq("created_by", admin.id)
    .order("created_at", { ascending: false });

  const rows = demos ?? [];
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id as string);
  const { data: profiles } = await svc
    .from("profiles")
    .select("id, plan_tier, persona")
    .in("id", ids);

  const profileById = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  return rows.map((row) => {
    const profile = profileById.get(row.id as string);
    const rawTier = String(profile?.plan_tier ?? "pro").toLowerCase();
    const planTier: BillingPlanId =
      rawTier === "student" || rawTier === "standard" || rawTier === "pro"
        ? rawTier
        : rawTier === "essentials"
          ? "standard"
          : "pro";

    return {
      id: row.id as string,
      email: String(row.email ?? ""),
      label: String(row.label ?? "Demo user"),
      created_at: row.created_at as string,
      planTier,
      persona: (profile?.persona as UserPersona | null) ?? null,
    };
  });
}

export async function createDemoUser(input: {
  label: string;
  planTier?: BillingPlanId;
  /** @deprecated use planTier: "student" */
  makeStudent?: boolean;
}): Promise<void> {
  const admin = await requireAdmin();
  const svc = createServiceClient();

  const planTier: BillingPlanId =
    input.planTier ?? (input.makeStudent ? "student" : "pro");

  const email = randomDemoEmail();
  const password = `Demo-${Math.random().toString(36).slice(2)}-${Date.now()}`;

  const { data: created, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: input.label.trim() || "Demo user" },
  });
  if (error || !created?.user) {
    throw new Error(error?.message ?? "Failed to create demo user");
  }

  const demoId = created.user.id;

  const { error: insErr } = await svc.from("demo_users").insert({
    id: demoId,
    created_by: admin.id,
    email,
    label: input.label.trim() || "Demo user",
  });
  if (insErr) throw new Error(insErr.message);

  const { error: profileErr } = await svc
    .from("profiles")
    .update(profilePatchForDemoPlanTier(planTier))
    .eq("id", demoId);

  if (profileErr) throw new Error(profileErr.message);

  revalidatePath("/admin");
}

export async function deleteDemoUser(id: string): Promise<void> {
  const admin = await requireAdmin();
  const svc = createServiceClient();

  const { data: owned } = await svc
    .from("demo_users")
    .select("id")
    .eq("id", id)
    .eq("created_by", admin.id)
    .maybeSingle();
  if (!owned) throw new Error("Demo user not found");

  await svc.from("demo_users").delete().eq("id", id);
  await svc.auth.admin.deleteUser(id);

  revalidatePath("/admin");
}

export { getStoredImpersonatorEmail, restoreAdminFromImpersonation };

export async function listAllUsers(): Promise<AdminUserRow[]> {
  await requireAdmin();
  const svc = createServiceClient();

  const authUsers: {
    id: string;
    email?: string;
    created_at?: string;
    last_sign_in_at?: string;
  }[] = [];

  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const batch = data.users ?? [];
    authUsers.push(
      ...batch.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }))
    );
    if (batch.length < perPage) break;
    page += 1;
    if (page > 50) break;
  }

  const ids = authUsers.map((u) => u.id);
  if (ids.length === 0) return [];

  const [{ data: profiles }, { data: demoRows }, { data: resumeRows }, { data: appRows }] =
    await Promise.all([
      svc.from("profiles").select("id, full_name, persona, onboarding_persona_set, created_at").in("id", ids),
      svc.from("demo_users").select("id, label").in("id", ids),
      svc.from("resume_versions").select("user_id").in("user_id", ids),
      svc.from("applications").select("user_id").in("user_id", ids),
    ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const demoIds = new Set((demoRows ?? []).map((d) => d.id));

  const resumeCounts = new Map<string, number>();
  for (const row of resumeRows ?? []) {
    resumeCounts.set(row.user_id, (resumeCounts.get(row.user_id) ?? 0) + 1);
  }

  const appCounts = new Map<string, number>();
  for (const row of appRows ?? []) {
    appCounts.set(row.user_id, (appCounts.get(row.user_id) ?? 0) + 1);
  }

  const rows: AdminUserRow[] = authUsers
    .filter((u) => u.email)
    .map((u) => {
      const profile = profileById.get(u.id);
      const email = u.email!;
      return {
        id: u.id,
        email,
        fullName: profile?.full_name ?? null,
        persona: (profile?.persona as UserPersona | null) ?? null,
        onboardingPersonaSet: Boolean(profile?.onboarding_persona_set),
        createdAt: u.created_at ?? profile?.created_at ?? new Date().toISOString(),
        lastSignInAt: u.last_sign_in_at ?? null,
        resumeCount: resumeCounts.get(u.id) ?? 0,
        applicationCount: appCounts.get(u.id) ?? 0,
        isDemo: demoIds.has(u.id),
        isAdmin: isAdminEmail(email),
      };
    });

  rows.sort((a, b) => {
    const aTime = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0;
    const bTime = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0;
    return bTime - aTime;
  });

  return rows;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const users = await listAllUsers();
  return computeAdminStats(users);
}

function computeAdminStats(users: AdminUserRow[]): AdminDashboardStats {
  return {
    totalUsers: users.length,
    activeUsers30d: users.filter((u) => isActiveUser(u.lastSignInAt)).length,
    signedInToday: users.filter((u) => isSignedInToday(u.lastSignInAt)).length,
    studentPersonas: users.filter((u) => u.persona === "student").length,
    professionalPersonas: users.filter((u) => u.persona === "professional").length,
    noPersona: users.filter((u) => !u.persona).length,
  };
}

export async function getAdminDashboardData(): Promise<{
  users: AdminUserRow[];
  stats: AdminDashboardStats;
}> {
  const users = await listAllUsers();
  return { users, stats: computeAdminStats(users) };
}

export async function viewAsUser(userId: string): Promise<void> {
  await startViewingAsUser(userId);
}

export async function viewAsDemoUser(id: string): Promise<void> {
  const admin = await requireAdmin();
  const svc = createServiceClient();

  const { data: demo } = await svc
    .from("demo_users")
    .select("id")
    .eq("id", id)
    .eq("created_by", admin.id)
    .maybeSingle();
  if (!demo) throw new Error("Demo user not found");

  await viewAsUser(id);
}

export async function stopViewingAs(): Promise<void> {
  await restoreAdminFromImpersonation();
}

export async function resetUserPersona(userId: string): Promise<void> {
  await requireAdmin();
  const svc = createServiceClient();

  const { error } = await svc
    .from("profiles")
    .update({
      persona: null,
      onboarding_persona_set: false,
      is_student: false,
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export type ImpersonationState = {
  impersonating: boolean;
  label: string | null;
};

export async function getImpersonationState(): Promise<ImpersonationState> {
  const adminEmail = getStoredImpersonatorEmail();
  if (!adminEmail) return { impersonating: false, label: null };

  const user = await getRealUser();

  if (!user) {
    return { impersonating: true, label: "another user" };
  }

  const svc = createServiceClient();
  const [{ data: demo }, { data: profile }] = await Promise.all([
    svc.from("demo_users").select("label, email").eq("id", user.id).maybeSingle(),
    svc.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  const label =
    demo?.label ??
    profile?.full_name?.trim() ??
    user.email ??
    "user";

  return {
    impersonating: true,
    label,
  };
}
