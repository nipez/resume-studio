import { createServiceClient } from "@/lib/supabase/server";

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const svc = createServiceClient();
  const normalized = email.trim().toLowerCase();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);

    const match = data.users.find(
      (user) => user.email?.trim().toLowerCase() === normalized
    );
    if (match?.id) return match.id;

    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

export async function setUserPassword(email: string, password: string): Promise<string> {
  const svc = createServiceClient();
  const normalized = email.trim().toLowerCase();
  const existingId = await findUserIdByEmail(normalized);

  if (existingId) {
    const { error } = await svc.auth.admin.updateUserById(existingId, { password });
    if (error) throw new Error(error.message);
    return existingId;
  }

  const { data, error } = await svc.auth.admin.createUser({
    email: normalized,
    password,
    email_confirm: true,
  });
  if (error || !data.user?.id) {
    throw new Error(error?.message ?? "Failed to create user");
  }
  return data.user.id;
}

export async function inviteUser(email: string, redirectTo: string): Promise<void> {
  const svc = createServiceClient();
  const { error } = await svc.auth.admin.inviteUserByEmail(email.trim().toLowerCase(), {
    redirectTo,
  });
  if (error) throw new Error(error.message);
}

export async function sendPasswordRecovery(email: string, redirectTo: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing Supabase env vars");
  }

  const res = await fetch(`${url}/auth/v1/recover`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      redirect_to: redirectTo,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { msg?: string; message?: string } | null;
    const message = body?.msg ?? body?.message ?? `Recover failed (${res.status})`;
    throw new Error(message);
  }
}
