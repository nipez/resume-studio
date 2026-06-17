import Link from "next/link";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import { MarketingPageCta } from "@/components/marketing/shared/marketing-page-cta";
import { BETA_BANNER, PRICING_PLANS, SITE_NAME } from "@/lib/marketing/content";
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
              AI generators charge per credit. Scanners charge $50/mo. {SITE_NAME}{" "}
              is subscription pricing for the full application OS — from $2.99 for
              students and $4.99 for the workspace without AI.
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
            <h2>Three tiers. No credit traps.</h2>
            <p>
              <strong>Essentials</strong> is the smart default — full workspace,
              zero AI cost. Student on-ramp for first resumes. Pro when you&apos;re
              applying aggressively and need AI (100 actions/mo).
            </p>
          </Reveal>
          <Reveal className="pgrid">
            {[...PRICING_PLANS]
              .sort((a, b) => {
                const order = { essentials: 0, pro: 1, student: 2 };
                return order[a.id as keyof typeof order] - order[b.id as keyof typeof order];
              })
              .map((plan) => (
              <div key={plan.id} className={`plan${plan.highlighted ? " feat" : ""}`}>
                {plan.highlighted ? <span className="pop">Best value</span> : null}
                {!plan.highlighted && plan.id === "pro" ? (
                  <span className="pop pro-pop">Active search</span>
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
            <h2>Job search is temporary — pricing shouldn&apos;t punish you.</h2>
            <p>
              Students need a cheap on-ramp. <strong>Essentials</strong> covers organizing and
              tracking without AI costs — keep it for your whole search. Pro is for when
              you&apos;re applying aggressively and need AI (100 actions per month).
            </p>
          </Reveal>
          <Reveal className="tier-tags">
            {["Essentials anchor", "Student on-ramp", "Pro · 100 AI actions/mo"].map((label) => (
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
        title="Start free during beta"
        description="All plans unlocked while we build. Sign in with a magic link and explore the full workspace."
        secondaryHref="/faq"
        secondaryLabel="Read the FAQ →"
      />
    </div>
  );
}
