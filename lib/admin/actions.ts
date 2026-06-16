"use server";

import { isAdminEmail, isAdminUser } from "@/lib/auth/admin";
import {
  IMPERSONATOR_COOKIE,
  decodeImpersonator,
  encodeImpersonator,
} from "@/lib/admin/impersonation";
import { DEMO_PERSONA } from "@/lib/demo/persona-data";
import { seedDemoPersona } from "@/lib/demo/seed-persona";
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

  await seedDemoPersona(svc, demoId, {
    fullName: input.label.trim() || DEMO_PERSONA.fullName,
    replace: false,
  });

  if (input.makeStudent) {
    await svc
      .from("profiles")
      .update({ is_student: true, student_level: "high_school" })
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

// Establish a real Supabase session for `email` on the current browser by
// minting a magic-link token (service role) and verifying it server-side.
async function establishSession(email: string): Promise<void> {
  const svc = createServiceClient();
  const { data, error } = await svc.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) {
    throw new Error(error?.message ?? "Failed to generate session");
  }
  const supabase = createClient();
  const { error: verifyErr } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (verifyErr) throw new Error(verifyErr.message);
}

export async function viewAsDemoUser(id: string): Promise<void> {
  const admin = await requireAdmin();
  const svc = createServiceClient();

  const { data: demo } = await svc
    .from("demo_users")
    .select("id, email")
    .eq("id", id)
    .eq("created_by", admin.id)
    .maybeSingle();
  if (!demo?.email) throw new Error("Demo user not found");

  // Remember who to restore, signed so it can't be forged.
  cookies().set(IMPERSONATOR_COOKIE, encodeImpersonator(admin.email!), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  await establishSession(demo.email);
  revalidatePath("/", "layout");
}

export async function stopViewingAs(): Promise<void> {
  const cookieStore = cookies();
  const adminEmail = decodeImpersonator(
    cookieStore.get(IMPERSONATOR_COOKIE)?.value
  );
  // Only restore an account that is a configured admin.
  if (!adminEmail || !isAdminEmail(adminEmail)) {
    cookieStore.delete(IMPERSONATOR_COOKIE);
    throw new Error("No valid admin session to return to");
  }

  await establishSession(adminEmail);
  cookieStore.delete(IMPERSONATOR_COOKIE);
  revalidatePath("/", "layout");
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
  const { data } = await svc
    .from("demo_users")
    .select("label, email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    impersonating: true,
    label: data?.label ?? data?.email ?? user.email ?? "demo user",
  };
}
