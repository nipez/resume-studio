import { createClient, createServiceClient } from "@/lib/supabase/server";

/** Mint a magic-link token and verify it to establish a browser session. */
export async function establishSession(email: string): Promise<void> {
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
