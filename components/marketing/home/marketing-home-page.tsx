import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import {
  APPLICATION_OS_LOOP,
  FRAGMENTED_STACK,
  GENERATOR_VS_OS,
  HOW_IT_WORKS,
  POSITIONING_PILLARS,
  PRICING_PLANS,
  PRICING_SECTION_HEADLINE,
  PRICING_SECTION_SUB,
  PILOT_CTA,
  PILOT_FINE_PRINT,
  SITE_NAME,
  SITE_TAGLINE_PRIMARY,
  SITE_TAGLINE_SECONDARY,
  TESTIMONIALS,
} from "@/lib/marketing/content";
import { MarketingHomeTemplates } from "./marketing-home-templates";
import { Reveal } from "./reveal-on-scroll";
import "./marketing-home.css";

const LOOP_LABELS = ["Library", "Tailor", "Cover", "Q&A", "Track", "Insights"] as const;

const MODULE_ICONS = [
  <svg key="library" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="5" rx="1.5" /><rect x="4" y="11" width="16" height="5" rx="1.5" /><path d="M7 19h10" /></svg>,
  <svg key="target" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l3.5 9" /><circle cx="6" cy="18" r="2.5" /><circle cx="17" cy="16" r="2.5" /><path d="M19 3L9.5 14" /></svg>,
  <svg key="mail" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>,
  <svg key="chat" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H9l-4 3z" /><path d="M8 10h8" /></svg>,
  <svg key="briefcase" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5" /><path d="M4 17l5-4 4 3 7-7" /><path d="M16 6h4v4" /></svg>,
  <svg key="chart" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 12l4-2" /><path d="M12 12v5" /></svg>,
];

const PILLAR_COLORS = ["var(--coral)", "var(--teal)", "var(--coral)", "var(--teal)"];

const TESTIMONIAL_AVATARS = ["var(--ink)", "var(--teal)", "var(--coral)"];

const TESTIMONIAL_INITIALS = ["JM", "PK", "AR"];

// Deep-link straight into the student guided builder (after magic-link sign-in).
const STUDENT_BUILD_HREF = `/login?next=${encodeURIComponent("/build?mode=student")}`;

const STUDENT_SECTION_CHIPS = [
  "Clubs & leadership",
  "Sports & athletics",
  "Volunteering",
  "Honors & awards",
  "GPA & coursework",
  "Part-time jobs",
];

export function MarketingHomePage() {
  // Conservative low-end monthly total of the fragmented stack, rounded down
  // to the nearest $10 for an honest "from $X/mo" contrast against our pricing.
  const stackMonthlyLow =
    Math.floor(
      FRAGMENTED_STACK.reduce((sum, item) => sum + (item.monthlyLow ?? 0), 0) / 10
    ) * 10;

  return (
    <div className="marketing-home">
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-lead">
            <span className="eyebrow">The Application OS</span>
            <h1>
              One system for your <span className="serif-i">entire</span> job search.
            </h1>
            <p className="hero-sub hero-sub-full">
              {SITE_TAGLINE_PRIMARY} {SITE_TAGLINE_SECONDARY} Library, tailor, cover letters, Q&amp;A, tracking, and insights — connected in one workspace.
            </p>
            <p className="hero-sub hero-sub-mobile">
              {SITE_TAGLINE_PRIMARY} Six modules — library, tailor, cover letters, Q&amp;A, tracking, and insights — in one workspace.
            </p>
          </div>
          <div className="loop-wrap">
            <div className="loop">
              <div className="loop-ring" />
              <div className="loop-blob" />
              <div className="loop-spin">
                {APPLICATION_OS_LOOP.map((node, index) => (
                  <div key={node.step} className={`node n${index + 1}`}>
                    <div>
                      <span className="num">{node.step}</span>
                      <span className="lbl">{LOOP_LABELS[index]}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="loop-core">
                <span className="big">6→1</span>
                <span className="small">closed loop</span>
              </div>
            </div>
          </div>
          <div className="hero-actions">
            <div className="hero-cta">
              <Link href="/login" className="btn btn-coral">
                Get started free
              </Link>
              <Link href="/application-os" className="link-underline">
                See the application OS →
              </Link>
            </div>
            <div className="first-resume-callout">
              <div>
                <p>Creating your first resume?</p>
                <span>You&apos;re in the right place.</span>
              </div>
              <Link href={STUDENT_BUILD_HREF}>Get started →</Link>
            </div>
          </div>
          <div className="trust">
            <span className="trust-item">
              <span className="check">✓</span>
              One login, six modules
            </span>
            <span className="trust-item">
              <span className="check">✓</span>
              Immutable snapshots
            </span>
            <span className="trust-item">
              <span className="check">✓</span>
              Human-sounding AI drafts
            </span>
          </div>
        </div>
        <div className="snap-strip">
          <div className="wrap inner">
            <span className="snap-saved">Snapshot saved</span>
            <span className="sep">·</span>
            <span>
              Resume + cover + Q&amp;A frozen the moment you hit send — so your insights never lie to you.
            </span>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="problem-glow" />
        <div className="wrap" style={{ position: "relative" }}>
          <Reveal className="sec-head" style={{ maxWidth: 720 }}>
            <span className="eyebrow dark">The problem</span>
            <h2>Job search shouldn&apos;t require a five-tool stack.</h2>
            <p>
              Most seekers stitch together a resume builder, ATS scanner, tracker, Google Doc, and an AI generator — then lose track of which version went where. That&apos;s not a workflow. That&apos;s duct tape.
            </p>
          </Reveal>
          <Reveal className="replace">
            <Logo size={44} className="rlogo shrink-0" />
            <div>
              <b>{SITE_NAME} replaces the stack.</b>
              <span>
                {" "}
                One application OS with six integrated modules and snapshots
                that keep your history honest — from{" "}
                <strong className="replace-price">$2.99/mo</strong>, replacing a
                stack that can run <strong>${stackMonthlyLow}+/mo</strong>.
              </span>
            </div>
          </Reveal>
          <Reveal className="stack-frame">
            <div className="stack-caption">
              What you&apos;d otherwise pay for separately — not what you pay here
            </div>
            <div className="stack">
              {FRAGMENTED_STACK.map((item) => (
                <div key={item.tool} className="stack-card">
                  <h4>{item.tool}</h4>
                  <p>{item.problem}</p>
                  <div className="cost-row">
                    <span className="cost-label">Typical cost</span>
                    <span className="price-tag">{item.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="features">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow">The application OS</span>
            <h2>Six modules. One closed loop.</h2>
            <p>
              Generators stop at the download. An application OS runs the full
              cycle — build, tailor, send, snapshot, and learn.
            </p>
          </Reveal>
          <Reveal className="mgrid home-module-teaser">
            {APPLICATION_OS_LOOP.slice(0, 3).map((module, index) => (
              <div key={module.step} className="mcard">
                <div className="top">
                  <span className="micon">{MODULE_ICONS[index]}</span>
                  <span className="mnum">{module.step}</span>
                </div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
            ))}
          </Reveal>
          <Reveal className="home-module-links">
            <Link href="/features" className="btn btn-coral">
              Explore all features
            </Link>
            <Link href="/application-os" className="link-underline">
              Why an application OS? →
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head" style={{ maxWidth: 680 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>Why {SITE_NAME}</span>
            <h2>Why an application OS beats another resume builder.</h2>
            <p>
              The market is split between expensive ATS scanners, tracker-first tools with weekly AI pricing, and builders with trial traps. {SITE_NAME} is the honest, affordable middle: one workspace from first draft to interview prep.
            </p>
          </Reveal>
          <Reveal className="why-grid">
            {POSITIONING_PILLARS.map((pillar, index) => (
              <div key={pillar.accent} className="why-card">
                <div className="tag" style={{ color: PILLAR_COLORS[index] }}>
                  {pillar.accent}
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="dark" id="compare">
        <div className="wrap" style={{ maxWidth: 1060 }}>
          <Reveal className="sec-head center">
            <span className="eyebrow dark">Generators vs. application OS</span>
            <h2>
              Fast PDFs are fine for 5 jobs.
              <br />
              Serious searches need a system.
            </h2>
            <p>
              Credit-based generators optimize a moment. {SITE_NAME} optimizes the entire search — with versions, tracking, snapshots, and insights that compound over months.
            </p>
          </Reveal>
          <Reveal className="compare-wrap">
            <div className="ctable compare-table-desktop">
              <div className="crow head">
                <div className="c1">Dimension</div>
                <div className="c2">AI resume generators</div>
                <div className="c3">{SITE_NAME} · Application OS</div>
              </div>
              {GENERATOR_VS_OS.slice(0, 6).map((row) => (
                <div key={row.dimension} className="crow">
                  <div className="c1">{row.dimension}</div>
                  <div className="c2">{row.generator}</div>
                  <div className="c3">{row.applicationOs}</div>
                </div>
              ))}
            </div>
            <div className="compare-cards">
              {GENERATOR_VS_OS.slice(0, 6).map((row) => (
                <div key={row.dimension} className="compare-card">
                  <div className="compare-card-title">{row.dimension}</div>
                  <div className="compare-card-col">
                    <span className="compare-card-label">AI resume generators</span>
                    <p>{row.generator}</p>
                  </div>
                  <div className="compare-card-col compare-card-col-us">
                    <span className="compare-card-label">{SITE_NAME}</span>
                    <p>{row.applicationOs}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 600 }}>
            <span className="eyebrow">Workflow</span>
            <h2>From blank page to tracked applications.</h2>
            <p>
              A quick overview — see the{" "}
              <Link href="/features" className="features-inline-link">
                full feature tour
              </Link>{" "}
              for module-by-module detail.
            </p>
          </Reveal>
          <Reveal className="steps">
            <div className="steps-line" />
            {HOW_IT_WORKS.map((step, index) => (
              <div key={step.step} className={`step${index === 2 ? " accent" : ""}`}>
                <div className="badge">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="templates">
        <div className="wrap">
          <Reveal className="sec-head" style={{ maxWidth: 560 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>Templates</span>
            <h2>Three templates, print-ready.</h2>
            <p>
              Classic, Two-Column, and Editorial — with full PDF export.{" "}
              <Link href="/features#templates" className="features-inline-link">
                See templates →
              </Link>
            </p>
          </Reveal>
          <MarketingHomeTemplates />
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 560 }}>
            <span className="eyebrow">Testimonials</span>
            <h2>Built for real job searches.</h2>
            <p>Early pilot feedback from professionals, parents, and career switchers.</p>
          </Reveal>
          <Reveal className="tg">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={testimonial.name} className="quote">
                <div className="qmark">“</div>
                <p>{testimonial.quote}</p>
                <div className="who">
                  <span
                    className="avatar"
                    style={{ background: TESTIMONIAL_AVATARS[index] }}
                  >
                    {TESTIMONIAL_INITIALS[index]}
                  </span>
                  <div>
                    <div className="name">{testimonial.name}</div>
                    <div className="role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="students-band">
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 700 }}>
            <span className="eyebrow">For students &amp; parents</span>
            <h2>Get your kid going — their first resume, done right.</h2>
            <p>
              High school and college students turn clubs, sports, volunteering,
              and honors into a real resume with a guided, step-by-step builder.
              Parents: set them up in a single sitting — from $2.99/mo, free
              during pilot.
            </p>
          </Reveal>
          <Reveal className="students-chips">
            {STUDENT_SECTION_CHIPS.map((chip) => (
              <span key={chip} className="students-chip">
                {chip}
              </span>
            ))}
          </Reveal>
          <Reveal className="students-band-cta">
            <Link href={STUDENT_BUILD_HREF} className="btn btn-coral">
              Get your student started
            </Link>
            <Link href="/students" className="link-underline">
              See the student guide →
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 600 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>Pricing</span>
            <h2>{PRICING_SECTION_HEADLINE}</h2>
            <p>{PRICING_SECTION_SUB}</p>
          </Reveal>
          <Reveal className="pgrid">
            {PRICING_PLANS.map((plan) => (
              <div key={plan.id} className={`plan${plan.highlighted ? " feat" : ""}`}>
                {plan.highlighted && <span className="pop">Recommended</span>}
                <div className="kicker">{plan.badge}</div>
                <div className="pname">{plan.name}</div>
                <div className="priceline">
                  <span className="amt">{plan.price}</span>
                  <span className="per">{plan.period}</span>
                </div>
                <p className="pdesc">{plan.description}</p>
                <Link
                  href="/login"
                  className={`plan-btn${plan.highlighted ? " coral" : ""}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </Reveal>
          <Reveal className="pricing-more">
            <Link href="/pricing">Full pricing details →</Link>
          </Reveal>
        </div>
      </section>

      <section className="cta-sec">
        <div className="wrap">
          <Reveal className="cta">
            <div className="ring1" />
            <div className="ring2" />
            <div className="cta-inner">
              <h2>Run your job search like a system.</h2>
              <p>
                {PILOT_CTA}. The application OS — resumes and cover letters that sound like you wrote them.
              </p>
              <Link href="/login" className="btn btn-dark">
                Open {SITE_NAME}
              </Link>
              <div className="fine">{PILOT_FINE_PRINT}</div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
