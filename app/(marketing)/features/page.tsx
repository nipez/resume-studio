import { ApplicationOsLoop } from "@/components/marketing/application-os-loop";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { GeneratorVsOs } from "@/components/marketing/generator-vs-os";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { TemplateGallery } from "@/components/marketing/template-gallery";
import { SITE_DESCRIPTION } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — Resume Studio",
  description: SITE_DESCRIPTION,
};

export default function FeaturesPage() {
  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Application OS modules
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
            Features
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
            Six integrated modules that mirror how serious job searches actually
            work — connected in one workspace, not scattered across five
            subscriptions.
          </p>
        </div>
      </section>
      <ApplicationOsLoop />
      <FeatureGrid
        title="Every module in the loop"
        description="Each tool shares the same resume data, job context, and application history."
      />
      <GeneratorVsOs />
      <HowItWorks />
      <TemplateGallery />
      <MarketingCta
        title="Try the application OS free during beta"
        description="All modules included. Sign in with your email and start building."
      />
    </main>
  );
}
