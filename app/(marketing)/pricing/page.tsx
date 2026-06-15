import { MarketingCta } from "@/components/marketing/marketing-cta";
import { MeshBackground } from "@/components/marketing/primitives";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Pricing — ${SITE_NAME}`,
  description:
    "Subscription pricing for the application OS — not credit packs. Student $2.99/mo. Essentials $4.99/mo. Pro $12/mo. Free during beta.",
};

const COMPARISON_SNIPPETS = [
  { tool: "AI generators", cost: "$9–29/mo", note: "Credit packs, no tracking" },
  { tool: "ATS scanners", cost: "$50/mo", note: "Score only, no workspace" },
  { tool: SITE_NAME, cost: "From $2.99", note: "Full application OS" },
];

export default function PricingPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-[#152238] to-[#0a0c10]" />
        <MeshBackground dark />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7FA6FF]">
            Honest pricing
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Honest pricing for a tough job market
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-[#AEB6C2]">
            AI generators charge per credit. Scanners charge $50/mo. {SITE_NAME} is subscription pricing for the full application OS — from
            $2.99 for students and $4.99 for the workspace without AI.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {COMPARISON_SNIPPETS.map((item) => (
              <div
                key={item.tool}
                className={`rounded-xl border px-4 py-3 ${
                  item.tool === SITE_NAME
                    ? "border-accent/40 bg-accent/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div
                  className={`text-[12px] font-bold uppercase tracking-wider ${item.tool === SITE_NAME ? "text-[#7FA6FF]" : "text-[#6E7686]"}`}
                >
                  {item.tool}
                </div>
                <div className="mt-1 font-display text-lg font-semibold text-white">
                  {item.cost}
                </div>
                <div className="mt-0.5 text-[11px] text-[#AEB6C2]">
                  {item.note}
                </div>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl rounded-xl border border-[#CDEBD9]/40 bg-[#0E7C4B]/15 px-5 py-3.5 text-[14px] font-medium text-[#D4F0E3]">
            Pro tip: Job Search Pass — $39 for 3 months of unlimited Pro (coming
            at launch)
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(47,107,255,0.05),transparent_50%)]" />
        <div className="relative">
          <PricingCards />
        </div>
      </section>

      <section className="border-t border-border bg-page">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Why three tiers?
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Job search is temporary — you shouldn&apos;t pay enterprise prices
            for a 3-month sprint. Students need a cheap on-ramp. Essentials
            covers organizing and tracking without AI costs. Pro is for when
            you&apos;re applying aggressively and need unlimited tailoring,
            cover letters, and insights.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {["Student on-ramp", "No-AI essentials", "Unlimited Pro"].map(
              (label) => (
                <span
                  key={label}
                  className="rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-ink"
                >
                  {label}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <MarketingCta />
    </main>
  );
}
