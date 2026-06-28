import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/marketing/content";

type MarketingBrandProps = {
  light?: boolean;
  href?: string;
  hideTagline?: boolean;
  logoSize?: number;
};

export function MarketingBrand({
  light = false,
  href = "/",
  hideTagline = false,
  logoSize = 44,
}: MarketingBrandProps) {
  const content = (
    <>
      <Logo
        size={logoSize}
        className="shrink-0 shadow-[0_8px_20px_-8px_rgba(15,181,166,0.5)]"
      />
      <span>
        <span
          className={`block font-display text-[16.5px] font-semibold leading-none ${light ? "text-white" : "text-[#231a2e]"}`}
        >
          {SITE_NAME}
        </span>
        {!hideTagline && (
          <span
            className={`mt-[3px] hidden text-[10px] font-semibold uppercase tracking-[0.14em] sm:block ${light ? "text-[#ff8a5c]" : "text-[#ff5c38]"}`}
          >
            {SITE_TAGLINE}
          </span>
        )}
      </span>
    </>
  );

  return (
    <Link href={href} className="flex items-center gap-3">
      {content}
    </Link>
  );
}
