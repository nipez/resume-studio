import Link from "next/link";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import { MarketingFaqAccordion } from "@/components/marketing/shared/marketing-faq-accordion";
import { MarketingPageCta } from "@/components/marketing/shared/marketing-page-cta";
import { FAQ_ITEMS } from "@/lib/marketing/content";
import "@/components/marketing/home/marketing-home.css";
import "@/components/marketing/shared/marketing-subpage.css";

export function FaqPage() {
  return (
    <div className="marketing-home">
      <section className="sub-hero">
        <div className="wrap">
          <Reveal className="sub-hero-inner center">
            <span className="eyebrow">FAQ</span>
            <h1>
              Straight answers about the{" "}
              <span className="serif-i">application OS</span>
            </h1>
            <p className="sub-hero-sub">
              Snapshots, honest AI, pricing, and how we differ from credit-based
              generators and tracker-only tools.
            </p>
            <div className="sub-hero-cta">
              <Link href="/application-os" className="link-underline">
                What is an application OS? →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal>
            <MarketingFaqAccordion items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>

      <MarketingPageCta
        title="Still have questions?"
        description="The best way to learn is to try it. Sign in free and explore the workspace."
        secondaryHref="/students"
        secondaryLabel="Student FAQ →"
      />
    </div>
  );
}
