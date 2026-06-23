import Link from "next/link";
import { PILOT_FINE_PRINT, PILOT_START_CTA, SITE_NAME } from "@/lib/marketing/content";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import "@/components/marketing/home/marketing-home.css";
import "./application-os.css";

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

export function ApplicationOsPage() {
  return (
    <div className="marketing-home">
      <section className="aos-hero">
        <div className="wrap aos-hero-grid">
          <div>
            <span className="aos-eyebrow">The application OS</span>
            <h1>
              A generator gives you a PDF.
              <br />
              An <span className="serif-i">OS</span> runs your whole search.
            </h1>
            <p className="aos-sub">
              {SITE_NAME} connects resume versions, tailoring, cover letters,
              Q&amp;A, tracking, and insights into one closed loop — with an
              immutable snapshot of every send.
            </p>
            <div className="aos-cta">
              <Link href="/login" className="btn btn-coral">
                {PILOT_START_CTA}
              </Link>
              <Link href="/features" className="aos-ghost">
                See what&apos;s included →
              </Link>
            </div>
            <div className="aos-stats">
              <div className="aos-stat">
                <div className="v">6→1</div>
                <div className="l">modules, one workspace</div>
              </div>
              <div className="aos-stat">
                <div className="v">100%</div>
                <div className="l">snapshot fidelity</div>
              </div>
              <div className="aos-stat">
                <div className="v">1</div>
                <div className="l">login, not five tools</div>
              </div>
            </div>
          </div>
          <div className="aos-mock-wrap">
            <div className="aos-window">
              <div className="aos-window-bar">
                <span className="brand">R</span>
                <span className="ttl">{SITE_NAME}</span>
                <span className="tag">Application OS</span>
              </div>
              <div className="aos-window-body">
                <div className="aos-side">
                  {LOOP_LABELS.map((label, index) => (
                    <div
                      key={label}
                      className={`item${index === 4 ? " active" : ""}`}
                    >
                      <span className="ic">{MODULE_ICONS[index]}</span>
                      {label}
                    </div>
                  ))}
                </div>
                <div className="aos-canvas">
                  <div className="aos-doc">
                    <div className="nm">Master Resume</div>
                    <div className="ln m" />
                    <div className="ln" />
                    <div className="ln s" />
                  </div>
                  <div className="aos-snap">
                    <span className="chk">✓</span>
                    <span className="tx">
                      <b>Snapshot saved.</b> Resume + cover + Q&amp;A frozen
                      exactly as sent.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="aos-loopback">↻ feeds back to Library</div>
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
          <Reveal className="mgrid aos-phase-grid">
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

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 620 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              The closed loop
            </span>
            <h2>Six steps. One workspace. Insights feed back.</h2>
            <p>
              Each stage hands off to the next — and logging an application
              snapshots what you sent so learning stays tied to reality.
            </p>
          </Reveal>
          <Reveal className="aos-flow-strip">
            {LOOP_LABELS.map((label, index) => (
              <div key={label} className="aos-flow-step">
                <span className="aos-flow-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="aos-flow-label">{label}</span>
                {index < LOOP_LABELS.length - 1 ? (
                  <span className="aos-flow-arrow" aria-hidden>
                    →
                  </span>
                ) : (
                  <span className="aos-flow-loop" aria-hidden>
                    ↻ Library
                  </span>
                )}
              </div>
            ))}
          </Reveal>
          <Reveal className="aos-concept-note">
            <p>
              <b>Why snapshots matter.</b> When your master resume evolves, past
              applications stay frozen — resume, cover letter, and Q&amp;A exactly
              as submitted. Insights compare what actually got interviews, not
              what you wish you&apos;d sent.
            </p>
            <Link href="/features" className="link-underline">
              See each module in detail →
            </Link>
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
                {PILOT_START_CTA}. Resumes and cover letters that sound like you — explore every
                module on the features page.
              </p>
              <div className="aos-cta-row">
                <Link href="/login" className="btn btn-dark">
                  Open {SITE_NAME}
                </Link>
                <Link href="/features" className="link-underline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.35)" }}>
                  Feature tour →
                </Link>
              </div>
              <div className="fine">{PILOT_FINE_PRINT}</div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
