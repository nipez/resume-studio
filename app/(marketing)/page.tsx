import { ComparisonTable } from "@/components/marketing/comparison-table";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { PositioningSection } from "@/components/marketing/positioning-section";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { StatsBar } from "@/components/marketing/stats-bar";
import { TemplateGallery } from "@/components/marketing/template-gallery";
import { Testimonials } from "@/components/marketing/testimonials";

export default function HomePage() {
  return (
    <main>
      <MarketingHero />
      <StatsBar />
      <PositioningSection />
      <FeatureGrid
        title="Six tools. One workspace."
        description="Everything Teal, Jobscan, and a cover-letter doc do separately — connected, with snapshots."
      />
      <ComparisonTable />
      <HowItWorks />
      <TemplateGallery />
      <Testimonials />
      <PricingPreview />
      <MarketingCta
        title="Your next interview starts here"
        description="Free during beta. Student plans from $2.99. No credit card tricks."
      />
    </main>
  );
}
