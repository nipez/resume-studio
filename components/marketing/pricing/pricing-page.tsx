import Link from "next/link";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import { MarketingPageCta } from "@/components/marketing/shared/marketing-page-cta";
import { BETA_BANNER, PRICING_PLANS, PILOT_CTA, SITE_NAME } from "@/lib/marketing/content";
import "@/components/marketing/home/marketing-home.css";
import "@/components/marketing/shared/marketing-subpage.css";
import "./pricing.css";

const COMPARISON_SNIPPETS = [
  {
    tool: "AI generators",
    cost: "$9–29/mo",
    note: "Credit packs, no tracking",
    strikethrough: true,
  },
  {
    tool: "ATS scanners",
    cost: "$50/mo",
    note: "Score only, no workspace",
    strikethrough: true,
  },
  {
    tool: SITE_NAME,
    cost: "From $2.99",
    note: "Full application OS",
    savings: "Save $76–150/mo",
    highlight: true,
  },
] as const;

export function PricingPage() {
  return (
    <div className="marketing-home">
      <section className="sub-hero">
        <div className="wrap">
          <div className="sub-hero-inner center">
            <span className="eyebrow">Honest pricing</span>
            <h1>
              Pricing for a <span className="serif-i">tough</span> job market
            </h1>
            <p className="sub-hero-sub">
              AI generators charge per credit and often sound robotic. Scanners charge $50/mo.{" "}
              {SITE_NAME} is subscription pricing for the full application OS — Pro from $19 with
              human-sounding tailoring, or Essentials at $4.99 to organize your search.
            </p>
            <div className="price-chips">
              {COMPARISON_SNIPPETS.map((item) => (
                <div
                  key={item.tool}
                  className={`price-chip${"highlight" in item && item.highlight ? " highlight" : ""}`}
                >
                  <div className="label">{item.tool}</div>
                  <div
                    className={`amt${"strikethrough" in item && item.strikethrough ? " struck" : ""}`}
                  >
                    {item.cost}
                  </div>
                  {"savings" in item && item.savings ? (
                    <div className="savings">{item.savings}</div>
                  ) : null}
                  <div className="note">{item.note}</div>
                </div>
              ))}
            </div>
            <p className="beta-note">{BETA_BANNER}</p>
          </div>
        </div>
      </section>

      <section className="pricing">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              Plans
            </span>
            <h2>Three tiers. Pro is where the AI lives.</h2>
            <p>
              <strong>Pro</strong> is the full apply loop — job-tailored resumes, cover letters
              that sound like you, Q&amp;A, and interview prep. <strong>Essentials</strong> is the
              smart budget pick for organizing your search yourself. <strong>Student</strong> for
              first resumes.
            </p>
          </Reveal>
          <Reveal className="pgrid">
            {[...PRICING_PLANS]
              .sort((a, b) => {
                const order = { pro: 0, essentials: 1, student: 2 };
                return order[a.id as keyof typeof order] - order[b.id as keyof typeof order];
              })
              .map((plan) => (
              <div key={plan.id} className={`plan${plan.highlighted ? " feat" : ""}`}>
                {plan.highlighted ? <span className="pop">Recommended</span> : null}
                {!plan.highlighted && plan.id === "student" ? (
                  <span className="pop pro-pop">First resume</span>
                ) : null}
                <div className="kicker">{plan.badge}</div>
                <div className="pname">{plan.name}</div>
                <div className="priceline">
                  <span className="amt">{plan.price}</span>
                  <span className="per">{plan.period}</span>
                </div>
                <p className="pdesc">{plan.description}</p>
                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`plan-btn${plan.highlighted ? " coral" : ""}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 640 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              Why three tiers
            </span>
            <h2>Job search is temporary — your tools shouldn&apos;t sound like a robot.</h2>
            <p>
              Pro gives you AI that reads like a human wrote it — tailored per job, editable,
              and grounded in your real experience. Essentials keeps the workspace affordable
              when you write everything yourself. Student for the first resume on-ramp.
            </p>
          </Reveal>
          <Reveal className="tier-tags">
            {["Pro · human-sounding AI", "Essentials · organize & track", "Student on-ramp"].map((label) => (
              <span key={label} className="tier-tag">
                {label}
              </span>
            ))}
          </Reveal>
          <Reveal className="pricing-pass-note">
            <p>
              <b>Job Search Pass — $39 for 3 months of Pro</b> (coming at launch).
              Built for sprint searches without a year-long subscription.
            </p>
            <Link href="/students" className="link-underline">
              See the Student plan →
            </Link>
          </Reveal>
        </div>
      </section>

      <MarketingPageCta
        title={`Start free — ${PILOT_CTA.toLowerCase()}`}
        description="Full Pro access while we pilot with early users. Sign in with a magic link — no credit card."
        secondaryHref="/faq"
        secondaryLabel="Read the FAQ →"
      />
    </div>
  );
}
