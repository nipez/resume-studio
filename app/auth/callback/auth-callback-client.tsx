"use client";

import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
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
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace(dest);
          router.refresh();
          return;
        }
      }

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as EmailOtpType,
        });
        if (!error) {
          router.replace(dest);
          router.refresh();
          return;
        }
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
