"use client";

import { createClient } from "@/lib/supabase/client";
import { SITE_NAME } from "@/lib/marketing/content";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";
  const nextParam = searchParams.get("next");
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    authError ? "That sign-in link expired or didn't work. Try again." : null
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    // Keep the magic-link redirect on the plain (allow-listed) callback URL.
    // Stash the post-login destination locally so it survives the round-trip
    // without relying on Supabase preserving query params on redirect_to.
    const redirectTo = `${window.location.origin}/auth/callback`;
    try {
      if (safeNext) window.localStorage.setItem("postLoginNext", safeNext);
      else window.localStorage.removeItem("postLoginNext");
    } catch {
      // ignore storage errors
    }

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-[0_8px_26px_rgba(15,17,22,0.07)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-[#7A53FF] font-display text-base font-bold text-white shadow-accent">
            R
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
              {SITE_NAME}
            </h1>
            <p className="text-[12px] text-muted">Sign in to your account</p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-[11px] border border-[#CDEBD9] bg-[#EAF7F0] px-4 py-4 text-[14px] leading-relaxed text-[#0E7C4B]">
            <p className="font-semibold">Check your email</p>
            <p className="mt-1">
              We sent a magic link to <strong>{email}</strong>. Click it to sign
              in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-muted">
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="rounded-[9px] border border-[#DFE3E8] px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </label>

            {error ? (
              <p className="rounded-[9px] border border-[#F0C7C7] bg-[#FFF6F6] px-3 py-2 text-[13px] text-[#B23B3B]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[11px] bg-accent px-4 py-3 text-[13.5px] font-semibold text-white shadow-accent transition hover:bg-accent-dark disabled:opacity-60"
            >
              {loading ? "Sending link…" : "Send magic link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[12.5px] leading-relaxed text-muted">
          No password needed. We&apos;ll email you a one-time sign-in link.
        </p>
      </div>
    </main>
  );
}
