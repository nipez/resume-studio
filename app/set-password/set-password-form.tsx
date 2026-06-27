"use client";

import { MarketingBrand } from "@/components/marketing/marketing-brand";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

export default function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    return createClient(url, anonKey, {
      auth: {
        storageKey: "rt-invite-setup",
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }, []);

  useEffect(() => {
    if (!supabase) {
      setError("Auth is not configured.");
      return;
    }

    async function bootstrapSession() {
      if (!supabase) {
        setError("Auth is not configured.");
        return;
      }

      const code = searchParams.get("code");
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError("This setup link expired or was already used.");
          return;
        }
        setReady(true);
        return;
      }

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          setError("This setup link expired or was already used.");
          return;
        }
        window.history.replaceState({}, "", window.location.pathname);
        setReady(true);
        return;
      }

      setError("Open the invite or reset link from your email to set a password.");
    }

    bootstrapSession();
  }, [searchParams, supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !ready) return;

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login?message=password-set");
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <MarketingBrand />
        <Link
          href="/login"
          className="text-[13.5px] font-semibold text-[#5c5269] transition hover:text-[#231a2e]"
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-12 pt-4">
        <div className="w-full max-w-md rounded-[24px] border border-[rgba(40,20,30,.08)] bg-white p-7 shadow-[0_16px_48px_-20px_rgba(40,20,30,0.18)] sm:p-8">
          <h1 className="font-display text-[24px] font-semibold tracking-[-0.025em] text-[#231a2e]">
            Set your password
          </h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#5c5269]">
            Choose a password for daily sign-in. You won&apos;t need email links after this.
          </p>

          {error ? (
            <p className="mt-4 rounded-[12px] border border-[#f0c7c7] bg-[#fff6f6] px-3.5 py-2.5 text-[13px] text-[#b23b3b]">
              {error}
            </p>
          ) : null}

          {ready ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="flex flex-col gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8a8094]">
                New password
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-[12px] border border-[rgba(40,20,30,.12)] bg-[#fbf6f2]/40 px-3.5 py-3 text-[15px] normal-case tracking-normal text-[#231a2e] focus:border-[#ff5c38] focus:outline-none focus:ring-2 focus:ring-[#ff5c38]/15"
                />
              </label>
              <label className="flex flex-col gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8a8094]">
                Confirm password
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="rounded-[12px] border border-[rgba(40,20,30,.12)] bg-[#fbf6f2]/40 px-3.5 py-3 text-[15px] normal-case tracking-normal text-[#231a2e] focus:border-[#ff5c38] focus:outline-none focus:ring-2 focus:ring-[#ff5c38]/15"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[13px] bg-[#ff5c38] px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(255,92,56,.65)] transition hover:-translate-y-px hover:bg-[#f04f2d] disabled:opacity-60"
              >
                {loading ? "Saving…" : "Save password"}
              </button>
            </form>
          ) : (
            !error && (
              <p className="mt-6 text-sm text-[#5c5269]">Preparing your setup link…</p>
            )
          )}
        </div>
      </main>
    </div>
  );
}
