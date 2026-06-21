import Link from "next/link";
import { MarketingBrand } from "@/components/marketing/marketing-brand";
import { NAV_LINKS, SITE_DESCRIPTION, SITE_NAME } from "@/lib/marketing/content";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="bg-[#231a2e] px-6 py-16 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <MarketingBrand light href="/" />
            <p className="mt-[18px] max-w-[340px] text-[14.5px] leading-relaxed text-[#9b91a6]">
              {SITE_DESCRIPTION}
            </p>
          </div>

          <div>
            <div className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-[#7a7184]">
              Product
            </div>
            <div className="mt-[18px] flex flex-col gap-3 text-[14.5px] text-[#c4bacd]">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              ))}
              <Link href="/login" className="transition hover:text-white">
                Sign in
              </Link>
            </div>
          </div>

          <div>
            <div className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-[#7a7184]">
              Compare
            </div>
            <div className="mt-[18px] flex flex-col gap-3 text-[14.5px] text-[#c4bacd]">
              <Link href="/application-os" className="transition hover:text-white">
                vs. AI generators
              </Link>
              <span>vs. Teal — full loop + snapshots</span>
              <span>vs. Jobscan — 8× cheaper entry</span>
              <span>vs. Resume.io — no trial traps</span>
            </div>
          </div>

          <div>
            <div className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-[#7a7184]">
              Legal
            </div>
            <div className="mt-[18px] flex flex-col gap-3 text-[14.5px] text-[#c4bacd]">
              {LEGAL_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-2.5 pt-7 text-[13.5px] text-[#7a7184] sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <span>Built for serious job searches.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
