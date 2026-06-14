import Link from "next/link";
import { NAV_LINKS, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/marketing/content";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-sidebar text-[#AEB6C2]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-[#7A53FF] font-display text-base font-bold text-white shadow-accent">
                R
              </div>
              <div>
                <span className="font-display text-lg font-semibold text-white">
                  {SITE_NAME}
                </span>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#7FA6FF]">
                  {SITE_TAGLINE}
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[#AEB6C2]">
              {SITE_DESCRIPTION}
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] transition hover:text-[#7FA6FF]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/login" className="text-[14px] transition hover:text-[#7FA6FF]">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
              Compare
            </h3>
            <ul className="mt-4 space-y-3 text-[14px]">
              <li>
                <Link href="/application-os" className="transition hover:text-[#7FA6FF]">
                  vs. AI generators
                </Link>
              </li>
              <li className="text-[#6E7686]">vs. Teal — full loop + snapshots</li>
              <li className="text-[#6E7686]">vs. Jobscan — 8× cheaper entry</li>
              <li className="text-[#6E7686]">vs. Resume.io — no trial traps</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-[#6E7686] sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p className="text-[12px]">Built for serious job searches.</p>
        </div>
      </div>
    </footer>
  );
}
