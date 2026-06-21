import Link from "next/link";
import { MarketingBrand } from "@/components/marketing/marketing-brand";
import { NAV_LINKS } from "@/lib/marketing/content";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(40,20,30,.08)] bg-[#fbf6f2]/82 backdrop-blur-[16px]">
      <div className="marketing-shell-pad mx-auto flex max-w-[1180px] items-center justify-between gap-3 py-3 sm:gap-4 sm:py-3.5">
        <div className="min-w-0 shrink">
          <MarketingBrand />
        </div>

        <nav className="hidden items-center gap-[30px] text-[14.5px] font-medium text-[#5c5269] md:flex">
          {NAV_LINKS.map((link) =>
            link.href === "/students" ? (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center rounded-full border border-[#ff5c38]/40 bg-[#ff5c38]/10 px-3 py-1 font-semibold text-[#ff5c38] transition hover:border-[#ff5c38]/70 hover:bg-[#ff5c38]/15"
              >
                {link.label} · Parents
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-[#231a2e]"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-[18px]">
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-[rgba(40,20,30,.1)] px-2.5 py-1.5 text-[12.5px] font-semibold text-[#5c5269] marker:content-none sm:px-3 sm:py-2 sm:text-[13px]">
              Menu
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-[rgba(40,20,30,.1)] bg-white py-2 shadow-[0_12px_40px_rgba(40,20,30,.12)]">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2.5 text-[14px] font-medium text-[#5c5269] transition hover:bg-[#fbf6f2] hover:text-[#231a2e]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>

          <Link
            href="/login"
            className="hidden whitespace-nowrap text-[14.5px] font-semibold text-[#231a2e] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-[10px] bg-[#231a2e] px-3 py-2 text-[13px] font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_10px_22px_-8px_rgba(40,20,30,.5)] sm:px-[18px] sm:py-2.5 sm:text-[14.5px]"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
