import { randomInt } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCodeValue(): string {
  const pick = (n: number) =>
    Array.from({ length: n }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `RT-${pick(4)}-${pick(4)}`;
}

/** Accepts `RT-XXXX-XXXX` or the same characters without separators. */
export function parseInviteCode(raw: string): string | null {
  const compact = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (compact.length !== 10 || !compact.startsWith("RT")) return null;
  const body = compact.slice(2);
  for (let i = 0; i < body.length; i += 1) {
    if (!ALPHABET.includes(body[i])) return null;
  }
  return `RT-${body.slice(0, 4)}-${body.slice(4)}`;
}

export type InviteCodeRow = {
  id: string;
  code: string;
  note: string | null;
  createdAt: string;
  usedAt: string | null;
  usedBy: string | null;
  usedByEmail: string | null;
  revokedAt: string | null;
};

export async function consumeInviteCode(raw: string): Promise<{ id: string; code: string } | null> {
  const code = parseInviteCode(raw);
  if (!code) return null;

  const svc = createServiceClient();
  const { data, error } = await svc
    .from("signup_invite_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("code", code)
    .is("used_at", null)
    .is("revoked_at", null)
    .select("id, code")
    .maybeSingle();

  if (error || !data?.id) return null;
  return { id: String(data.id), code: String(data.code) };
}

export async function attachInviteCodeUser(
  inviteId: string,
  userId: string
): Promise<void> {
  const svc = createServiceClient();
  const { error } = await svc
    .from("signup_invite_codes")
    .update({ used_by: userId })
    .eq("id", inviteId);
  if (error) throw new Error(error.message);
}

export async function releaseInviteCode(inviteId: string): Promise<void> {
  const svc = createServiceClient();
  await svc
    .from("signup_invite_codes")
    .update({ used_at: null, used_by: null })
    .eq("id", inviteId)
    .is("used_by", null);
}
