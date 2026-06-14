import { MarketingCta } from "@/components/marketing/marketing-cta";
import { PricingCards } from "@/components/marketing/pricing-cards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Resume Studio",
  description: "Resume Studio is free during beta. No credit card required.",
};

export default function PricingPage() {
  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
            Simple, honest pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
            Free while we&apos;re in beta. Build your resume library, tailor to
            jobs, and track applications without hitting a paywall.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <PricingCards />
      </section>

      <MarketingCta />
    </main>
  );
}
