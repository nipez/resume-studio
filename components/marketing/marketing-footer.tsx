import Link from "next/link";
import { NAV_LINKS, SITE_NAME } from "@/lib/marketing/content";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-[#7A53FF] font-display text-base font-bold text-white shadow-accent">
                R
              </div>
              <span className="font-display text-lg font-semibold text-ink">
                {SITE_NAME}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
              AI-assisted resumes and job applications — built for clarity,
              truthfulness, and a calmer job search.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-muted transition hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  className="text-[14px] text-muted transition hover:text-accent"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink">
              Get started
            </h3>
            <p className="mt-4 text-[14px] leading-relaxed text-muted">
              Free during beta. No credit card required.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-[11px] bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-accent transition hover:bg-accent-dark"
            >
              Open Resume Studio
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted sm:text-left">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
