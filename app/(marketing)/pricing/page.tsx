import { MarketingCta } from "@/components/marketing/marketing-cta";
import { PricingCards } from "@/components/marketing/pricing-cards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Resume Studio",
  description:
    "Subscription pricing for the application OS — not credit packs. Student $2.99/mo. Essentials $4.99/mo. Pro $12/mo. Free during beta.",
};

export default function PricingPage() {
  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Honest pricing for a tough job market
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
            AI generators charge per credit. Scanners charge $50/mo. Resume
            Studio is subscription pricing for the full application OS — from
            $2.99 for students and $4.99 for the workspace without AI.
          </p>
          <p className="mx-auto mt-4 max-w-xl rounded-xl border border-[#CDEBD9] bg-[#EAF7F0] px-4 py-3 text-[14px] font-medium text-[#0E7C4B]">
            Pro tip: Job Search Pass — $39 for 3 months of unlimited Pro (coming
            at launch)
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <PricingCards />
      </section>

      <section className="border-t border-border bg-page">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h2 className="font-display text-xl font-semibold text-ink">
            Why three tiers?
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Job search is temporary — you shouldn&apos;t pay enterprise prices
            for a 3-month sprint. Students need a cheap on-ramp. Essentials
            covers organizing and tracking without AI costs. Pro is for when
            you&apos;re applying aggressively and need unlimited tailoring,
            cover letters, and insights.
          </p>
        </div>
      </section>

      <MarketingCta />
    </main>
  );
}
