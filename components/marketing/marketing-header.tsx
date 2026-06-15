"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MarketingBrand } from "@/components/marketing/marketing-brand";
import { NAV_LINKS } from "@/lib/marketing/content";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  return (
    <header className="marketing-header sticky top-0 z-50 border-b border-[rgba(40,20,30,.08)] bg-[#fbf6f2]/82 backdrop-blur-[16px]">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-12">
        <MarketingBrand hideTaglineOnMobile />

        <nav className="hidden items-center gap-[30px] text-[14.5px] font-medium text-[#5c5269] md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[#231a2e]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-[18px]">
          <Link
            href="/login"
            className="hidden whitespace-nowrap text-[14.5px] font-semibold text-[#231a2e] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="hidden items-center justify-center whitespace-nowrap rounded-[10px] bg-[#231a2e] px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_10px_22px_-8px_rgba(40,20,30,.5)] sm:inline-flex"
          >
            Get started
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-[rgba(40,20,30,.1)] p-2.5 text-[#5c5269] transition hover:bg-white/60 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="marketing-mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="marketing-mobile-nav"
          className="fixed inset-0 top-[57px] z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#231a2e]/20 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="relative mx-4 mt-2 overflow-hidden rounded-2xl border border-[rgba(40,20,30,.1)] bg-white shadow-[0_20px_60px_-20px_rgba(40,20,30,.25)]">
            <div className="flex flex-col py-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-5 py-3.5 text-[15px] font-medium text-[#231a2e] transition hover:bg-[#fbf6f2]"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2.5 border-t border-[rgba(40,20,30,.08)] bg-[#fbf6f2]/60 px-4 py-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[10px] border border-[rgba(40,20,30,.12)] bg-white px-4 py-3 text-[15px] font-semibold text-[#231a2e] transition hover:bg-[#fbf6f2]"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[10px] bg-[#231a2e] px-4 py-3 text-[15px] font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_10px_22px_-8px_rgba(40,20,30,.5)]"
                onClick={() => setMenuOpen(false)}
              >
                Get started free
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
