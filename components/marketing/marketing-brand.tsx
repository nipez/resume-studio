import Link from "next/link";
import { Logo } from "@/components/brand/logo";
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
      <Logo
        size={34}
        className="shrink-0 shadow-[0_6px_16px_-6px_rgba(15,181,166,0.45)]"
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
    <Link href={href} className="flex items-center gap-[11px]">
      {content}
    </Link>
  );
}
