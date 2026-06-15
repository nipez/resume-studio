import type { User } from "@supabase/supabase-js";

// Master/admin accounts are configurable via the ADMIN_EMAILS env var
// (comma-separated). Falls back to the project owner so it works out of the box.
const DEFAULT_ADMIN_EMAILS = ["nickperez@gmail.com"];

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  const list = raw
    ? raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean)
    : DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase());
  return list;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export function isAdminUser(user: Pick<User, "email"> | null | undefined): boolean {
  return isAdminEmail(user?.email);
}
