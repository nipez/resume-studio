"use client";

import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ranRef = useRef(false);

  useEffect(() => {
    // Run exactly once. The magic-link code/token is single-use, so a second
    // pass (e.g. React strict-mode double-invoke) would fail and clobber the
    // successful redirect with an auth error.
    if (ranRef.current) return;
    ranRef.current = true;

    const supabase = createClient();

    let dest = "/library";
    try {
      const stored = window.localStorage.getItem("postLoginNext");
      if (stored && stored.startsWith("/") && !stored.startsWith("//")) {
        dest = stored;
      }
      window.localStorage.removeItem("postLoginNext");
    } catch {
      // ignore storage errors
    }

    async function finishSignIn() {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code).catch(() => {});
      } else if (tokenHash && type) {
        await supabase.auth
          .verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType })
          .catch(() => {});
      }

      // Some magic links (e.g. new-user confirmations) are verified by the
      // auth server itself and land here with the session already set. Treat a
      // present session as success regardless of the exchange result above.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace(dest);
        router.refresh();
        return;
      }

      router.replace("/login?error=auth");
    }

    finishSignIn();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6">
      <p className="text-sm text-muted">Signing you in…</p>
    </main>
  );
}
