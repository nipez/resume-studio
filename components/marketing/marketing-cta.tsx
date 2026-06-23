import { PILOT_FINE_PRINT, SITE_NAME } from "@/lib/marketing/content";
import { MeshBackground } from "@/components/marketing/primitives";
import Link from "next/link";

type MarketingCtaProps = {
  title?: string;
  description?: string;
};

export function MarketingCta({
  title = "Ready when you are",
  description = "Sign in with a magic link and run your job search from one application OS. Free during pilot — full Pro access.",
}: MarketingCtaProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sidebar via-[#1b2740] to-sidebar">
      <MeshBackground dark />
      <div className="relative mx-auto max-w-6xl px-6 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7FA6FF]">
            Get started
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[#AEB6C2]">
            {description}
          </p>
        </div>
        <Link
          href="/login"
          className="mt-10 inline-flex rounded-[11px] bg-accent px-8 py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(47,107,255,0.45)] transition hover:bg-accent-dark hover:shadow-[0_6px_28px_rgba(47,107,255,0.55)]"
        >
          Open {SITE_NAME}
        </Link>
        <p className="mt-5 text-[12.5px] text-[#6E7686]">
          {PILOT_FINE_PRINT}
        </p>
      </div>
    </section>
  );
}
