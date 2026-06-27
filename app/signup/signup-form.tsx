"use client";

import { MarketingBrand } from "@/components/marketing/marketing-brand";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage =
    error === "invalid"
      ? "Enter a valid email and a password with at least 8 characters."
      : error === "failed"
        ? "Could not create that account. Try signing in instead."
        : null;

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
            Create your account
          </h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#5c5269]">
            Set your email and password once. Daily sign-in sends no email.
          </p>

          {errorMessage ? (
            <p className="mt-4 rounded-[12px] border border-[#f0c7c7] bg-[#fff6f6] px-3.5 py-2.5 text-[13px] text-[#b23b3b]">
              {errorMessage}
            </p>
          ) : null}

          <form action="/api/auth/signup" method="post" className="mt-6 space-y-4">
            <label className="flex flex-col gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8a8094]">
              Email address
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                className="rounded-[12px] border border-[rgba(40,20,30,.12)] bg-[#fbf6f2]/40 px-3.5 py-3 text-[15px] normal-case tracking-normal text-[#231a2e] focus:border-[#ff5c38] focus:outline-none focus:ring-2 focus:ring-[#ff5c38]/15"
              />
            </label>
            <label className="flex flex-col gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8a8094]">
              Password
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="rounded-[12px] border border-[rgba(40,20,30,.12)] bg-[#fbf6f2]/40 px-3.5 py-3 text-[15px] normal-case tracking-normal text-[#231a2e] focus:border-[#ff5c38] focus:outline-none focus:ring-2 focus:ring-[#ff5c38]/15"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-[13px] bg-[#ff5c38] px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(255,92,56,.65)] transition hover:-translate-y-px hover:bg-[#f04f2d]"
            >
              Create account
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-[#5c5269]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:text-[#ff5c38]">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
