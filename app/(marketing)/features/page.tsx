import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { TemplateGallery } from "@/components/marketing/template-gallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — Resume Studio",
  description:
    "Resume library, AI tailoring, cover letters, application tracking, and insights — all in one workspace.",
};

export default function FeaturesPage() {
  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
            Features
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
            Everything you need to go from resume draft to tracked application —
            without juggling spreadsheets, docs, and half-finished cover letters.
          </p>
        </div>
      </section>
      <FeatureGrid
        title="The full toolkit"
        description="Six integrated tools that mirror how serious job searches actually work."
      />
      <HowItWorks />
      <TemplateGallery />
      <MarketingCta
        title="Try it free during beta"
        description="All features included. Sign in with your email and start building."
      />
    </main>
  );
}
