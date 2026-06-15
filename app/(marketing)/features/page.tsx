import { ApplicationOsLoop } from "@/components/marketing/application-os-loop";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { GeneratorVsOs } from "@/components/marketing/generator-vs-os";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { MeshBackground } from "@/components/marketing/primitives";
import { TemplateGallery } from "@/components/marketing/template-gallery";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Features — ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
};

export default function FeaturesPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EEF3FF] via-white to-page" />
        <MeshBackground />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Application OS modules
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Features
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
            Six integrated modules that mirror how serious job searches actually
            work — connected in one workspace, not scattered across five
            subscriptions.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Library", "Tailor", "Cover", "Q&A", "Track", "Insights"].map(
              (mod) => (
                <span
                  key={mod}
                  className="rounded-full border border-accent/20 bg-white/80 px-3.5 py-1.5 text-[12px] font-semibold text-accent backdrop-blur-sm"
                >
                  {mod}
                </span>
              )
            )}
          </div>
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
