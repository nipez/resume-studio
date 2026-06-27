"use client";

import { MarketingBrand } from "@/components/marketing/marketing-brand";
import {
  SITE_TAGLINE_PRIMARY,
  SITE_TAGLINE_SECONDARY,
  PILOT_CTA,
  PILOT_FINE_PRINT,
} from "@/lib/marketing/content";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const TRUST_ITEMS = [
  "Cover letters & tailoring that sound human",
  "Immutable snapshots on every send",
  PILOT_CTA + " — no card required",
] as const;

export default function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");
  const nextParam = searchParams.get("next");
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "";

  const errorMessage =
    error === "invalid"
      ? "Invalid email or password."
      : error === "missing"
        ? "Enter your email and password."
        : null;

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
            <div className="rounded-[24px] border border-[rgba(40,20,30,.08)] bg-white p-7 shadow-[0_16px_48px_-20px_rgba(40,20,30,0.18)] sm:p-8">
              <div className="mb-6">
                <h2 className="font-display text-[24px] font-semibold tracking-[-0.025em] text-[#231a2e]">
                  Welcome back
                </h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#5c5269]">
                  Use your email and password. You won&apos;t receive a login email.
                </p>
              </div>

              {message === "password-set" ? (
                <p className="mb-4 rounded-[12px] border border-[rgba(15,181,166,.35)] bg-[rgba(15,181,166,.08)] px-3.5 py-2.5 text-[13px] text-[#066b62]">
                  Password saved. Sign in below.
                </p>
              ) : null}

              {errorMessage ? (
                <p className="mb-4 rounded-[12px] border border-[#f0c7c7] bg-[#fff6f6] px-3.5 py-2.5 text-[13px] text-[#b23b3b]">
                  {errorMessage}
                </p>
              ) : null}

              <form action="/api/auth/login" method="post" className="space-y-4">
                {safeNext ? (
                  <input type="hidden" name="next" value={safeNext} />
                ) : null}
                <label className="flex flex-col gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8a8094]">
                  Email address
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="rounded-[12px] border border-[rgba(40,20,30,.12)] bg-[#fbf6f2]/40 px-3.5 py-3 text-[15px] normal-case tracking-normal text-[#231a2e] placeholder:text-[#b3aab8] focus:border-[#ff5c38] focus:outline-none focus:ring-2 focus:ring-[#ff5c38]/15"
                  />
                </label>
                <label className="flex flex-col gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8a8094]">
                  Password
                  <input
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    className="rounded-[12px] border border-[rgba(40,20,30,.12)] bg-[#fbf6f2]/40 px-3.5 py-3 text-[15px] normal-case tracking-normal text-[#231a2e] placeholder:text-[#b3aab8] focus:border-[#ff5c38] focus:outline-none focus:ring-2 focus:ring-[#ff5c38]/15"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full rounded-[13px] bg-[#ff5c38] px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(255,92,56,.65)] transition hover:-translate-y-px hover:bg-[#f04f2d]"
                >
                  Sign in
                </button>
              </form>

              <p className="mt-5 text-center text-[13px] text-[#5c5269]">
                <Link href="/signup" className="font-semibold hover:text-[#ff5c38]">
                  Create account
                </Link>
                <span className="mx-2 text-[#c4bcc8]">·</span>
                <Link
                  href="/forgot-password"
                  className="font-semibold hover:text-[#ff5c38]"
                >
                  Forgot password?
                </Link>
              </p>

              <p className="mt-6 text-center text-[12.5px] leading-relaxed text-[#8a8094]">
                {PILOT_FINE_PRINT.split(" · ")[0]}.
              </p>
            </div>

            <p className="mt-5 text-center text-[12px] text-[#8a8094] lg:text-left">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="font-semibold text-[#5c5269] hover:text-[#ff5c38]">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-semibold text-[#5c5269] hover:text-[#ff5c38]">
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
