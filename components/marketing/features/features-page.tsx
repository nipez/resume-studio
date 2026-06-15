import Link from "next/link";
import { MarketingHomeTemplates } from "@/components/marketing/home/marketing-home-templates";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import {
  APPLICATION_OS_LOOP,
  FEATURE_CAPABILITIES,
  HOW_IT_WORKS,
  SITE_NAME,
} from "@/lib/marketing/content";
import "@/components/marketing/home/marketing-home.css";
import "./features.css";

const LOOP_LABELS = ["Library", "Tailor", "Cover", "Q&A", "Track", "Insights"] as const;

const MODULE_ICONS = [
  <svg key="library" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="5" rx="1.5" /><rect x="4" y="11" width="16" height="5" rx="1.5" /><path d="M7 19h10" /></svg>,
  <svg key="target" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l3.5 9" /><circle cx="6" cy="18" r="2.5" /><circle cx="17" cy="16" r="2.5" /><path d="M19 3L9.5 14" /></svg>,
  <svg key="mail" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>,
  <svg key="chat" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H9l-4 3z" /><path d="M8 10h8" /></svg>,
  <svg key="briefcase" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5" /><path d="M4 17l5-4 4 3 7-7" /><path d="M16 6h4v4" /></svg>,
  <svg key="chart" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 12l4-2" /><path d="M12 12v5" /></svg>,
];

const CAPABILITY_ICONS = ["✎", "✦", "↗", "📸", "◫", "↻"];

const BENTO_SHORT = [
  "Master + role cuts",
  "JD → matched version",
  "Voice, not filler",
  "Batch or one-by-one",
  "Snapshot every send",
  "Funnel + learnings",
] as const;

export function FeaturesPage() {
  return (
    <div className="marketing-home">
      <section className="features-hero">
        <div className="wrap features-hero-grid">
          <div>
            <span className="eyebrow">Product tour</span>
            <h1>
              Everything in the{" "}
              <span className="serif-i">workspace.</span>
            </h1>
            <p className="features-hero-sub">
              Resume library and canvas editor. Tailor per job with AI. Cover
              letters, application Q&amp;A, tracking, and insights — plus job
              URL import, section-level AI, and PDF export.
            </p>
            <div className="features-hero-cta">
              <Link href="/login" className="btn btn-coral">
                Get started free
              </Link>
              <Link href="/application-os" className="link-underline">
                Why an application OS? →
              </Link>
            </div>
          </div>
          <div className="features-bento-wrap">
            <span className="features-bento-flow">6 modules</span>
            <div className="features-bento">
              {APPLICATION_OS_LOOP.map((module, index) => (
                <div
                  key={module.step}
                  className={`features-bento-tile${index === 1 ? " accent" : ""}`}
                >
                  <div className="bt-top">
                    <span className="bt-num">{module.step}</span>
                    <span className="bt-icon">{MODULE_ICONS[index]}</span>
                  </div>
                  <div>
                    <span className="bt-label">{LOOP_LABELS[index]}</span>
                    <p className="bt-desc">{BENTO_SHORT[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="snap-strip">
          <div className="wrap inner">
            <span className="snap-saved">Shared context</span>
            <span className="sep">·</span>
            <span>
              Import a job once — tailor, cover letter, and Q&amp;A all use the
              same role, company, and description.
            </span>
          </div>
        </div>
      </section>

      <section id="modules">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow">Modules</span>
            <h2>What each part of {SITE_NAME} does.</h2>
            <p>
              Six integrated tools — not six subscriptions. Each module passes
              context to the next.
            </p>
          </Reveal>
          <Reveal className="mgrid">
            {APPLICATION_OS_LOOP.map((module, index) => (
              <div key={module.step} className="mcard features-module-card">
                <div className="top">
                  <span className="micon">{MODULE_ICONS[index]}</span>
                  <span className="mnum">{module.step}</span>
                </div>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <span className="connects">→ {module.connectsTo}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 640 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              Built in
            </span>
            <h2>Capabilities across the workspace.</h2>
            <p>
              Editor, AI, imports, and snapshots — the details that matter when
              you&apos;re applying to dozens of roles over months.
            </p>
          </Reveal>
          <Reveal className="features-cap-grid">
            {FEATURE_CAPABILITIES.map((cap, index) => (
              <div key={cap.title} className="features-cap-card">
                <div className="features-cap-icon">{CAPABILITY_ICONS[index]}</div>
                <h3>{cap.title}</h3>
                <p>{cap.description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 600 }}>
            <span className="eyebrow">How it works</span>
            <h2>From blank page to tracked applications.</h2>
            <p>
              Import or build once, then run the loop for every role you target.
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

      <section className="templates" id="templates">
        <div className="wrap">
          <Reveal className="sec-head" style={{ maxWidth: 560 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              Templates
            </span>
            <h2>Three templates, print-ready.</h2>
            <p>
              Classic, Two-Column, and Editorial — custom accent color and full
              PDF export in the editor.
            </p>
          </Reveal>
          <MarketingHomeTemplates />
        </div>
      </section>

      <section className="cta-sec">
        <div className="wrap">
          <Reveal className="cta">
            <div className="ring1" />
            <div className="ring2" />
            <div className="cta-inner">
              <h2>Try every module free during beta.</h2>
              <p>
                Library, tailor, cover letters, Q&amp;A, tracking, and insights
                — one login, one workspace.
              </p>
              <Link href="/login" className="btn btn-dark">
                Open {SITE_NAME}
              </Link>
              <div className="features-compare-link">
                <Link href="/#compare">Compare to resume generators →</Link>
              </div>
              <div className="fine">No credit card · Magic link sign-in</div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
