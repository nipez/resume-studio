"use client";

import { MarketingBrand } from "@/components/marketing/marketing-brand";
import {
  SITE_NAME,
  SITE_TAGLINE_PRIMARY,
  SITE_TAGLINE_SECONDARY,
  PILOT_CTA,
  PILOT_FINE_PRINT,
} from "@/lib/marketing/content";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

const TRUST_ITEMS = [
  "Cover letters & tailoring that sound human",
  "Immutable snapshots on every send",
  PILOT_CTA + " — no card required",
] as const;

const FIRST_RESUME_HREF = `/login?next=${encodeURIComponent("/build?mode=student")}`;
const GOOGLE_AUTH_ENABLED =
  process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

type AuthMode = "password" | "magic";
type PasswordFlow = "sign-in" | "create";
type SentNotice = {
  title: string;
  body: string;
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";
  const nextParam = searchParams.get("next");
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("password");
  const [passwordFlow, setPasswordFlow] = useState<PasswordFlow>("sign-in");
  const [loading, setLoading] = useState(false);
  const [sentNotice, setSentNotice] = useState<SentNotice | null>(null);
  const [error, setError] = useState<string | null>(
    authError ? "That sign-in link expired or didn't work. Try again." : null
  );

  function redirectToWorkspace() {
    router.replace(safeNext ?? "/dashboard");
    router.refresh();
  }

  function callbackUrl() {
    const url = new URL("/auth/callback", window.location.origin);
    if (safeNext) url.searchParams.set("next", safeNext);
    return url.toString();
  }

  function rememberNext() {
    try {
      if (safeNext) window.localStorage.setItem("postLoginNext", safeNext);
      else window.localStorage.removeItem("postLoginNext");
    } catch {
      // ignore storage errors
    }
  }

  function friendlyAuthError(message: string) {
    if (message.toLowerCase().includes("rate")) {
      return "Email rate limit exceeded. Try Google or email/password, or wait a few minutes before requesting another link.";
    }

    return message;
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    setSentNotice(null);
    rememberNext();

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl(),
      },
    });

    if (signInError) {
      setLoading(false);
      setError(friendlyAuthError(signInError.message));
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSentNotice(null);
    rememberNext();

    const supabase = createClient();

    if (passwordFlow === "create") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl(),
        },
      });

      setLoading(false);

      if (signUpError) {
        setError(friendlyAuthError(signUpError.message));
        return;
      }

      if (data.session) {
        redirectToWorkspace();
        return;
      }

      setSentNotice({
        title: "Confirm your email",
        body: `We sent a confirmation email from ${SITE_NAME} to ${email}. After confirming, you can sign in with your password.`,
      });
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(friendlyAuthError(signInError.message));
      return;
    }

    redirectToWorkspace();
  }

  async function handleMagicLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSentNotice(null);
    rememberNext();

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl(),
      },
    });

    setLoading(false);

    if (signInError) {
      setError(friendlyAuthError(signInError.message));
      return;
    }

    setSentNotice({
      title: "Check your email",
      body: `We sent a sign-in link from ${SITE_NAME} to ${email}. Click it once to open your workspace.`,
    });
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#ff5c38]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#0fb5a6]/10 blur-3xl"
        aria-hidden
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <MarketingBrand />
        <Link
          href="/"
          className="text-[13.5px] font-semibold text-[#5c5269] transition hover:text-[#231a2e]"
        >
          ← Back to home
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8 lg:px-12">
        <div className="grid w-full max-w-[980px] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <section className="hidden lg:block">
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#231a2e] via-[#152238] to-[#1a2740] px-9 py-10 text-white shadow-[0_24px_60px_-20px_rgba(35,26,46,0.45)]">
              <div
                className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#ff5c38]/25 blur-3xl"
                aria-hidden
              />
              <span className="relative inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff8a5c]">
                Application OS
              </span>
              <h1 className="relative mt-5 font-display text-[clamp(28px,3.2vw,36px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                Pick up your job search where you left off.
              </h1>
              <p className="relative mt-4 text-[15px] leading-relaxed text-[#b8aec2]">
                {SITE_TAGLINE_PRIMARY} {SITE_TAGLINE_SECONDARY}
              </p>
              <ul className="relative mt-8 space-y-3">
                {TRUST_ITEMS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-[14px] text-[#d7d0e0]"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0fb5a6]/20 text-[11px] font-bold text-[#0fb5a6]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="w-full">
            <div className="mb-6 lg:hidden">
              <span className="inline-flex rounded-full border border-[rgba(40,20,30,.1)] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#ff5c38]">
                Sign in
              </span>
              <p className="mt-3 text-[15px] leading-relaxed text-[#5c5269]">
                {SITE_TAGLINE_PRIMARY}
              </p>
            </div>

            <div className="rounded-[24px] border border-[rgba(40,20,30,.08)] bg-white p-7 shadow-[0_16px_48px_-20px_rgba(40,20,30,0.18)] sm:p-8">
              <div className="mb-6">
                <h2 className="font-display text-[24px] font-semibold tracking-[-0.025em] text-[#231a2e]">
                  Welcome back
                </h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#5c5269]">
                  {GOOGLE_AUTH_ENABLED
                    ? "Use Google, email and password, or a one-time magic link."
                    : "Use email and password, or a one-time magic link."}
                </p>
              </div>

              {sentNotice ? (
                <div className="rounded-[14px] border border-[rgba(15,181,166,.35)] bg-[rgba(15,181,166,.08)] px-4 py-4 text-[14px] leading-relaxed text-[#0a8478]">
                  <p className="font-semibold text-[#066b62]">
                    {sentNotice.title}
                  </p>
                  <p className="mt-1.5 text-[#0a8478]">{sentNotice.body}</p>
                  <button
                    type="button"
                    onClick={() => setSentNotice(null)}
                    className="mt-4 text-[13px] font-semibold text-[#066b62] underline-offset-2 hover:underline"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {GOOGLE_AUTH_ENABLED ? (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-[13px] border border-[rgba(40,20,30,.14)] bg-white px-4 py-3.5 text-[15px] font-semibold text-[#231a2e] shadow-[0_12px_30px_-22px_rgba(40,20,30,.35)] transition hover:-translate-y-px hover:border-[#ff5c38]/35 disabled:opacity-60"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(40,20,30,.12)] text-[12px] font-bold text-[#ff5c38]">
                        G
                      </span>
                      Continue with Google
                    </button>
                  ) : null}

                  <div className="flex rounded-[14px] bg-[#fbf6f2] p-1">
                    {(["password", "magic"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setAuthMode(mode);
                          setError(null);
                        }}
                        className={`flex-1 rounded-[11px] px-3 py-2 text-[13px] font-semibold transition ${
                          authMode === mode
                            ? "bg-white text-[#231a2e] shadow-[0_8px_18px_-14px_rgba(40,20,30,.45)]"
                            : "text-[#8a8094] hover:text-[#5c5269]"
                        }`}
                      >
                        {mode === "password" ? "Email + password" : "Magic link"}
                      </button>
                    ))}
                  </div>

                  {authMode === "password" ? (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <label className="flex flex-col gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8a8094]">
                        Email address
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="you@example.com"
                          className="rounded-[12px] border border-[rgba(40,20,30,.12)] bg-[#fbf6f2]/40 px-3.5 py-3 text-[15px] normal-case tracking-normal text-[#231a2e] placeholder:text-[#b3aab8] focus:border-[#ff5c38] focus:outline-none focus:ring-2 focus:ring-[#ff5c38]/15"
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8a8094]">
                        Password
                        <input
                          type="password"
                          required
                          minLength={8}
                          autoComplete={
                            passwordFlow === "create"
                              ? "new-password"
                              : "current-password"
                          }
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="At least 8 characters"
                          className="rounded-[12px] border border-[rgba(40,20,30,.12)] bg-[#fbf6f2]/40 px-3.5 py-3 text-[15px] normal-case tracking-normal text-[#231a2e] placeholder:text-[#b3aab8] focus:border-[#ff5c38] focus:outline-none focus:ring-2 focus:ring-[#ff5c38]/15"
                        />
                      </label>

                      {error ? (
                        <p className="rounded-[12px] border border-[#f0c7c7] bg-[#fff6f6] px-3.5 py-2.5 text-[13px] text-[#b23b3b]">
                          {error}
                        </p>
                      ) : null}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-[13px] bg-[#ff5c38] px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(255,92,56,.65)] transition hover:-translate-y-px hover:bg-[#f04f2d] disabled:opacity-60"
                      >
                        {loading
                          ? "Working..."
                          : passwordFlow === "create"
                            ? "Create account"
                            : "Sign in"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPasswordFlow(
                            passwordFlow === "create" ? "sign-in" : "create"
                          );
                          setError(null);
                        }}
                        className="w-full text-center text-[12.5px] font-semibold text-[#5c5269] underline-offset-2 hover:text-[#ff5c38] hover:underline"
                      >
                        {passwordFlow === "create"
                          ? "Already have an account? Sign in"
                          : "New here? Create an account"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                      <label className="flex flex-col gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8a8094]">
                        Email address
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="you@example.com"
                          className="rounded-[12px] border border-[rgba(40,20,30,.12)] bg-[#fbf6f2]/40 px-3.5 py-3 text-[15px] normal-case tracking-normal text-[#231a2e] placeholder:text-[#b3aab8] focus:border-[#ff5c38] focus:outline-none focus:ring-2 focus:ring-[#ff5c38]/15"
                        />
                      </label>

                      {error ? (
                        <p className="rounded-[12px] border border-[#f0c7c7] bg-[#fff6f6] px-3.5 py-2.5 text-[13px] text-[#b23b3b]">
                          {error}
                        </p>
                      ) : null}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-[13px] bg-[#ff5c38] px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(255,92,56,.65)] transition hover:-translate-y-px hover:bg-[#f04f2d] disabled:opacity-60"
                      >
                        {loading ? "Sending link..." : "Send magic link"}
                      </button>
                    </form>
                  )}
                </div>
              )}

              <p className="mt-6 text-center text-[12.5px] leading-relaxed text-[#8a8094]">
                {GOOGLE_AUTH_ENABLED
                  ? "Google avoids email delays. "
                  : null}
                Password reset and confirmation emails still depend on your auth
                email provider.{" "}
                {PILOT_FINE_PRINT.split(" · ")[0]}.
              </p>
            </div>

            <div className="mt-4 rounded-[18px] border border-[#ff5c38]/20 bg-[#fff8f4] px-5 py-4 shadow-[0_12px_34px_-24px_rgba(255,92,56,0.55)]">
              <p className="font-display text-[18px] font-semibold tracking-[-0.02em] text-[#231a2e]">
                Creating your first resume?
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#5c5269]">
                You&apos;re in the right place. Use the guided builder for school,
                activities, volunteering, and first jobs.
              </p>
              <Link
                href={FIRST_RESUME_HREF}
                className="mt-3 inline-flex text-[13.5px] font-semibold text-[#ff5c38] transition hover:text-[#e84d2f]"
              >
                Get started →
              </Link>
            </div>

            <p className="mt-5 text-center text-[12px] text-[#8a8094] lg:text-left">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="font-semibold text-[#5c5269] hover:text-[#ff5c38]"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-semibold text-[#5c5269] hover:text-[#ff5c38]"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
