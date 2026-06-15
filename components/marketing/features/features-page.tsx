import Link from "next/link";
import { MarketingHomeTemplates } from "@/components/marketing/home/marketing-home-templates";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import {
  APPLICATION_OS_LOOP,
  FEATURE_CAPABILITIES,
  GENERATOR_VS_OS,
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

export function FeaturesPage() {
  return (
    <div className="marketing-home">
      <section className="features-hero">
        <div className="wrap features-hero-grid">
          <div>
            <span className="eyebrow">Features</span>
            <h1>
              Six modules.
              <br />
              One <span className="serif-i">connected</span> workspace.
            </h1>
            <p className="features-hero-sub">
              {SITE_NAME} isn&apos;t a PDF generator — it&apos;s an application OS
              with resume library, tailoring, cover letters, Q&amp;A, tracking,
              and insights. Same job context, same login, immutable snapshots.
            </p>
            <div className="features-hero-cta">
              <Link href="/login" className="btn btn-coral">
                Get started free
              </Link>
              <Link href="/application-os" className="link-underline">
                What is an application OS? →
              </Link>
            </div>
            <div className="features-chips">
              {LOOP_LABELS.map((label) => (
                <span key={label} className="features-chip">
                  {label}
                </span>
              ))}
            </div>
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
        </div>
        <div className="snap-strip">
          <div className="wrap inner">
            <span className="snap-saved">Snapshot saved</span>
            <span className="sep">·</span>
            <span>
              Every module shares resume data, job context, and application
              history — no re-pasting between tools.
            </span>
          </div>
        </div>
      </section>

      <section id="modules">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow">Application OS modules</span>
            <h2>Every tool in the loop.</h2>
            <p>
              Each module hands off to the next. Build a master resume, tailor
              per job, generate materials, log the send, and learn what works.
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
          <Reveal className="moat">
            <div className="badge">
              <span className="b1">↻</span>
              <span className="b2">feeds back</span>
            </div>
            <div>
              <span className="label">The moat</span>
              <p>
                When you log an application, {SITE_NAME} freezes the exact
                resume, cover letter, and Q&amp;A you sent. Insights stay tied
                to reality — even as your master resume keeps evolving.
              </p>
            </div>
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
              Beyond the six modules — editor, AI, imports, and snapshots
              designed for serious job searches over months, not one-off PDFs.
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

      <section className="templates">
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

      <section className="dark">
        <div className="wrap" style={{ maxWidth: 1060 }}>
          <Reveal className="sec-head center">
            <span className="eyebrow dark">Generators vs. application OS</span>
            <h2>
              Fast PDFs are fine for five jobs.
              <br />
              Serious searches need a system.
            </h2>
            <p>
              Credit-based generators optimize a single moment. {SITE_NAME}{" "}
              optimizes the entire search — versions, tracking, snapshots, and
              insights that compound over months.
            </p>
          </Reveal>
          <Reveal className="table-scroll">
            <div className="ctable">
              <div className="crow head">
                <div className="c1">Dimension</div>
                <div className="c2">AI resume generators</div>
                <div className="c3">{SITE_NAME} · Application OS</div>
              </div>
              {GENERATOR_VS_OS.map((row) => (
                <div key={row.dimension} className="crow">
                  <div className="c1">{row.dimension}</div>
                  <div className="c2">{row.generator}</div>
                  <div className="c3">{row.applicationOs}</div>
                </div>
              ))}
            </div>
          </Reveal>
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
                Library, tailor, cover letters, Q&amp;A, tracking, and insights —
                one login, one workspace.
              </p>
              <Link href="/login" className="btn btn-dark">
                Open {SITE_NAME}
              </Link>
              <div className="fine">No credit card · Magic link sign-in</div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
