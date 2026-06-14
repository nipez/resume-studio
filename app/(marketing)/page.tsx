import { ApplicationOsLoop } from "@/components/marketing/application-os-loop";
import { ComparisonTable } from "@/components/marketing/comparison-table";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { FragmentedStack } from "@/components/marketing/fragmented-stack";
import { GeneratorVsOs } from "@/components/marketing/generator-vs-os";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { PositioningSection } from "@/components/marketing/positioning-section";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { StatsBar } from "@/components/marketing/stats-bar";
import { TemplateGallery } from "@/components/marketing/template-gallery";
import { Testimonials } from "@/components/marketing/testimonials";
import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: `${SITE_NAME} — The application OS for job search`,
  description: SITE_DESCRIPTION,
};

export default function HomePage() {
  return (
    <main>
      <MarketingHero />
      <StatsBar />
      <ApplicationOsLoop />
      <FragmentedStack />
      <PositioningSection />
      <FeatureGrid
        title="Six modules. One workspace."
        description="Every module in the application OS shares the same data — no re-uploading, no copy-paste between tools, no version confusion."
      />
      <GeneratorVsOs />
      <ComparisonTable />
      <HowItWorks />
      <TemplateGallery />
      <Testimonials />
      <PricingPreview />
      <MarketingCta
        title="Run your job search like a system"
        description="Free during beta. The application OS — not another credit-based PDF generator."
      />
    </main>
  );
}
