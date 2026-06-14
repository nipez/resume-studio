import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { TemplateGallery } from "@/components/marketing/template-gallery";

export default function HomePage() {
  return (
    <main>
      <MarketingHero />
      <FeatureGrid limit={6} />
      <HowItWorks />
      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
                Built for truth, not fiction
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Tailoring and AI drafts reframe your real experience — they
                don&apos;t invent credentials. Every application snapshots what
                you sent, so your insights stay honest even after your master
                resume evolves.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-page p-6">
              <ul className="space-y-4 text-[14px] leading-relaxed text-muted">
                <li className="flex gap-3">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>Three print-ready resume templates</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>Light or deep tailoring per job description</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>Application pipeline with interview prep</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>Magic-link sign in — no passwords to remember</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <TemplateGallery />
      <MarketingCta />
    </main>
  );
}
