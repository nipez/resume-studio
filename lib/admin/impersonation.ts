import { createHmac } from "crypto";

export const IMPERSONATOR_COOKIE = "rt_impersonator";

// Sign the impersonator (admin) email so a "Return to my account" action can
// trust who to restore — without the data-layer being able to forge it. The
// service-role key is a server-only secret we reuse as the signing key.
function signingKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "insecure-dev-key";
}

function sign(value: string): string {
  return createHmac("sha256", signingKey()).update(value).digest("hex");
}

export function encodeImpersonator(adminEmail: string): string {
  const v = Buffer.from(adminEmail).toString("base64url");
  return `${v}.${sign(v)}`;
}

export function decodeImpersonator(cookie: string | undefined): string | null {
  if (!cookie) return null;
  const [v, sig] = cookie.split(".");
  if (!v || !sig) return null;
  if (sign(v) !== sig) return null;
  try {
    return Buffer.from(v, "base64url").toString("utf8");
  } catch {
    return null;
  }
}
