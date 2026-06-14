import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/marketing/content";

type MarketingBrandProps = {
  light?: boolean;
  href?: string;
  hideTagline?: boolean;
};

export function MarketingBrand({
  light = false,
  href = "/",
  hideTagline = false,
}: MarketingBrandProps) {
  const content = (
    <>
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#ff5c38] font-display text-lg font-bold text-white shadow-[0_6px_16px_-6px_rgba(255,92,56,.7)]">
        R
      </span>
      <span>
        <span
          className={`block font-display text-[16.5px] font-semibold leading-none ${light ? "text-white" : "text-[#231a2e]"}`}
        >
          {SITE_NAME}
        </span>
        {!hideTagline && (
          <span
            className={`mt-[3px] block text-[10px] font-semibold uppercase tracking-[0.14em] ${light ? "text-[#ff8a5c]" : "text-[#ff5c38]"}`}
          >
            {SITE_TAGLINE}
          </span>
        )}
      </span>
    </>
  );

  return (
    <Link href={href} className="flex items-center gap-[11px]">
      {content}
    </Link>
  );
}
