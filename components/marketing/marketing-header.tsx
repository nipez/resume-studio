import Link from "next/link";
import { NAV_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/marketing/content";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-[#7A53FF] font-display text-base font-bold text-white shadow-accent">
            R
          </div>
          <div>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              {SITE_NAME}
            </span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-accent sm:block">
              {SITE_TAGLINE}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-muted transition hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-[11px] px-4 py-2.5 text-[13.5px] font-semibold text-muted transition hover:text-accent sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-[11px] bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-accent transition hover:bg-accent-dark"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
