"use server";

import { isAdminEmail, isAdminUser } from "@/lib/auth/admin";
import {
  IMPERSONATOR_COOKIE,
  decodeImpersonator,
  encodeImpersonator,
} from "@/lib/admin/impersonation";
import {
  getStoredImpersonatorEmail,
  restoreAdminFromImpersonation,
} from "@/lib/admin/restore-session";
import { establishSession } from "@/lib/admin/session";
import type {
  AdminDashboardStats,
  AdminUserRow,
} from "@/lib/admin/types";
import {
  isActiveUser,
  isSignedInToday,
} from "@/lib/admin/types";
import type { UserPersona } from "@/lib/profile/persona";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type DemoUser = {
  id: string;
  email: string;
  label: string;
  created_at: string;
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

export async function listDemoUsers(): Promise<DemoUser[]> {
  const admin = await requireAdmin();
  const svc = createServiceClient();
  const { data } = await svc
    .from("demo_users")
    .select("id, email, label, created_at")
    .eq("created_by", admin.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as DemoUser[];
}

export async function createDemoUser(input: {
  label: string;
  makeStudent?: boolean;
}): Promise<void> {
  const admin = await requireAdmin();
  const svc = createServiceClient();

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

  if (input.makeStudent) {
    await svc
      .from("profiles")
      .update({
        is_student: true,
        student_level: "high_school",
        persona: "student",
        onboarding_persona_set: true,
        plan_tier: "student",
      })
      .eq("id", demoId);
  }

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
      svc.from("profiles").select("id, full_name, persona, created_at").in("id", ids),
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
  };
}

export async function getAdminDashboardData(): Promise<{
  users: AdminUserRow[];
  stats: AdminDashboardStats;
}> {
  const users = await listAllUsers();
  return { users, stats: computeAdminStats(users) };
}

async function resolveUserEmail(userId: string): Promise<string> {
  const svc = createServiceClient();
  const { data, error } = await svc.auth.admin.getUserById(userId);
  if (error || !data.user?.email) {
    throw new Error("User not found");
  }
  return data.user.email;
}

export async function viewAsUser(userId: string): Promise<void> {
  const admin = await requireAdmin();
  const email = await resolveUserEmail(userId);

  if (isAdminEmail(email)) {
    throw new Error("Cannot view as another admin account");
  }

  if (email.toLowerCase() === admin.email?.toLowerCase()) {
    throw new Error("You are already signed in as this account");
  }

  cookies().set(IMPERSONATOR_COOKIE, encodeImpersonator(admin.email!), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  await establishSession(email);
  revalidatePath("/", "layout");
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

export type ImpersonationState = {
  impersonating: boolean;
  label: string | null;
};

export async function getImpersonationState(): Promise<ImpersonationState> {
  const cookieStore = cookies();
  const adminEmail = decodeImpersonator(
    cookieStore.get(IMPERSONATOR_COOKIE)?.value
  );
  if (!adminEmail) return { impersonating: false, label: null };

  const user = await getRealUser();
  if (!user) return { impersonating: false, label: null };

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
