#!/usr/bin/env npx tsx
/**
 * Set or reset a Supabase Auth password without sending email.
 *
 * Usage:
 *   npx tsx scripts/set-auth-password.ts user@example.com 'NewPassword123!'
 *   BOOTSTRAP_EMAIL=user@example.com BOOTSTRAP_PASSWORD='...' npx tsx scripts/set-auth-password.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 */
import { createClient } from "@supabase/supabase-js";

async function findUserIdByEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  svc: any,
  email: string
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find(
      (user: { email?: string | null; id?: string }) =>
        user.email?.trim().toLowerCase() === normalized
    );
    if (match?.id) return match.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  const email = process.argv[2] ?? process.env.BOOTSTRAP_EMAIL;
  const password = process.argv[3] ?? process.env.BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    console.error(
      "Usage: npx tsx scripts/set-auth-password.ts <email> <password>"
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const svc = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const normalized = email.trim().toLowerCase();
  const existingId = await findUserIdByEmail(svc, normalized);

  if (existingId) {
    const { error } = await svc.auth.admin.updateUserById(existingId, { password });
    if (error) {
      console.error(error.message);
      process.exit(1);
    }
    console.log(`Updated password for ${normalized} (${existingId})`);
    return;
  }

  const { data, error } = await svc.auth.admin.createUser({
    email: normalized,
    password,
    email_confirm: true,
  });
  if (error || !data.user?.id) {
    console.error(error?.message ?? "Failed to create user");
    process.exit(1);
  }
  console.log(`Created ${normalized} (${data.user.id}) with password set.`);
}

main();
