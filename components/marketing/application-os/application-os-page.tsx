import Link from "next/link";
import {
  APPLICATION_OS_LOOP,
  GENERATOR_VS_OS,
  POSITIONING_PILLARS,
  SITE_NAME,
} from "@/lib/marketing/content";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import "@/components/marketing/home/marketing-home.css";

const LOOP_LABELS = ["Library", "Tailor", "Cover", "Q&A", "Track", "Insights"] as const;

const MODULE_ICONS = [
  <svg key="library" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="5" rx="1.5" /><rect x="4" y="11" width="16" height="5" rx="1.5" /><path d="M7 19h10" /></svg>,
  <svg key="target" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l3.5 9" /><circle cx="6" cy="18" r="2.5" /><circle cx="17" cy="16" r="2.5" /><path d="M19 3L9.5 14" /></svg>,
  <svg key="mail" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>,
  <svg key="chat" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H9l-4 3z" /><path d="M8 10h8" /></svg>,
  <svg key="briefcase" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5" /><path d="M4 17l5-4 4 3 7-7" /><path d="M16 6h4v4" /></svg>,
  <svg key="chart" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 12l4-2" /><path d="M12 12v5" /></svg>,
];

const PHASES = [
  {
    step: "01",
    title: "Build",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="5" rx="1.5" /><rect x="4" y="11" width="16" height="5" rx="1.5" /><path d="M7 19h10" /></svg>
    ),
    body: "A resume library with multiple cuts, three templates, and a default starting point. Your master stays clean while tailored versions branch off it.",
  },
  {
    step: "02",
    title: "Send",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h13" /><path d="M12 5l7 7-7 7" /></svg>
    ),
    body: "Tailor, cover letter, and Q&A from the same context — then log the application with everything snapshotted exactly as it went out the door.",
  },
  {
    step: "03",
    title: "Learn",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 12l4-2" /><path d="M12 12v5" /></svg>
    ),
    body: "Insights tied to real sends: which versions get interviews, where you stall, and what to fix next. Data that compounds across months of searching.",
  },
];

const PILLAR_COLORS = ["var(--coral)", "var(--teal)", "var(--coral)", "var(--teal)"];

export function ApplicationOsPage() {
  return (
    <div className="marketing-home">
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">The application OS</span>
            <h1>
              Generators give you a PDF. An OS runs your{" "}
              <span className="serif-i">entire</span> search.
            </h1>
            <p className="hero-sub">
              {SITE_NAME} connects resume versions, job-specific tailoring, cover
              letters, Q&amp;A, tracking, and insights in one closed loop — with an
              immutable snapshot of every send.
            </p>
            <div className="hero-cta">
              <Link href="/login" className="btn btn-coral">
                Start free during beta
              </Link>
              <Link href="/features" className="link-underline">
                Explore features →
              </Link>
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
                Subscription, not credits
              </span>
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
              Resume + cover + Q&amp;A frozen the moment you hit send — so your
              insights never lie to you.
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="sec-head" style={{ maxWidth: 640 }}>
            <span className="eyebrow">The lifecycle</span>
            <h2>Build. Send. Learn. On repeat.</h2>
            <p>
              A generator stops at the download. An application OS runs the whole
              cycle — so every application you send makes the next one sharper.
            </p>
          </Reveal>
          <Reveal className="mgrid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            {PHASES.map((phase) => (
              <div key={phase.title} className="mcard">
                <div className="top">
                  <span className="micon">{phase.icon}</span>
                  <span className="mnum">{phase.step}</span>
                </div>
                <h3>{phase.title}</h3>
                <p>{phase.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="modules">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow">Six modules</span>
            <h2>One closed loop, not six browser tabs.</h2>
            <p>
              Each module hands off to the next and feeds back into the first.
              Build, tailor, send, snapshot, and learn — without leaving the
              workspace.
            </p>
          </Reveal>
          <Reveal className="mgrid">
            {APPLICATION_OS_LOOP.map((module, index) => (
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
          <Reveal className="moat">
            <div className="badge">
              <span className="b1">↻</span>
              <span className="b2">feeds back</span>
            </div>
            <div>
              <span className="label">The moat</span>
              <p>
                When you log an application, {SITE_NAME} freezes the exact resume,
                cover letter, and Q&amp;A you sent. Insights stay tied to reality —
                even as your master resume keeps evolving.
              </p>
            </div>
          </Reveal>
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
              {GENERATOR_VS_OS.slice(0, 6).map((row) => (
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

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head" style={{ maxWidth: 680 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              Why an application OS
            </span>
            <h2>Why an OS beats another resume generator.</h2>
            <p>
              The market is split between expensive ATS scanners, tracker-first
              tools with weekly pricing, and builders with trial traps. {SITE_NAME}{" "}
              is the honest middle: one workspace from first draft to interview prep.
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

      <section className="cta-sec">
        <div className="wrap">
          <Reveal className="cta">
            <div className="ring1" />
            <div className="ring2" />
            <div className="cta-inner">
              <h2>Run your job search like a system.</h2>
              <p>
                Free during beta. The application OS — not another credit-based PDF
                generator.
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
