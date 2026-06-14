import { Logo } from "@/components/brand/logo";
import Link from "next/link";
import { NAV_LINKS, SITE_NAME, SITE_TAGLINE } from "@/lib/marketing/content";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="group flex items-center gap-3">
          <Logo
            size={36}
            className="shrink-0 shadow-accent transition group-hover:shadow-[0_6px_20px_rgba(47,107,255,0.4)]"
          />
          <div>
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              {SITE_NAME}
            </span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-accent sm:block">
              {SITE_TAGLINE}
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-[14px] font-medium text-muted transition hover:bg-page hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-border px-3 py-2 text-[13px] font-semibold text-muted marker:content-none">
              Menu
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-white py-2 shadow-[0_12px_40px_rgba(15,17,22,0.12)]">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2.5 text-[14px] font-medium text-muted transition hover:bg-page hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>

          <Link
            href="/login"
            className="hidden rounded-[11px] px-4 py-2.5 text-[13.5px] font-semibold text-muted transition hover:bg-page hover:text-accent sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-[11px] bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-accent transition hover:bg-accent-dark hover:shadow-[0_6px_20px_rgba(47,107,255,0.38)]"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
