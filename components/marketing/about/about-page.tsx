import Link from "next/link";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import { SITE_NAME } from "@/lib/marketing/content";
import "@/components/marketing/home/marketing-home.css";
import "@/components/marketing/shared/marketing-subpage.css";

const STATS = [
  "40+ years combined experience",
  "Resumes · Cover letters · Interviews",
  "Real-world placements",
];

const EXPERIENCE = [
  {
    icon: "🗂️",
    title: "40+ years, combined",
    body: "Our team has spent four decades reviewing resumes and cover letters and coaching candidates through every step of the hiring gauntlet.",
  },
  {
    icon: "📈",
    title: "Real placements, not theory",
    body: "We haven't just critiqued resumes — we've placed people into jobs. We know what moves someone from “maybe” to “hired.”",
  },
  {
    icon: "👀",
    title: "We've sat in the interviewer's seat",
    body: "We've screened stacks of applications and run the interviews, so we know what recruiters skim past — and what makes them stop.",
  },
  {
    icon: "🤝",
    title: "Both sides of the table",
    body: "Coaching candidates and hiring for teams gave us a rare 360° view of what actually gets results.",
  },
];

const PILLARS = [
  {
    icon: "📄",
    title: "A resume that gets read",
    body: "Turn real experience into crisp, outcome-focused bullets — with the structure recruiters expect at a glance.",
  },
  {
    icon: "✉",
    title: "Cover letters that sound like you",
    body: "Short, genuine letters tuned to each role and company — never stiff, generic filler.",
  },
  {
    icon: "🎤",
    title: "Interview prep",
    body: "Likely questions and strong talking points for each application, so you walk in ready instead of winging it.",
  },
  {
    icon: "📊",
    title: "Tracking what works",
    body: "Every send is snapshotted and tracked, so you learn which versions and pitches actually land — and do more of it.",
  },
];

export function AboutPage() {
  return (
    <div className="marketing-home">
      <section className="sub-hero">
        <div className="wrap">
          <div className="sub-hero-inner center">
            <span className="eyebrow">About us</span>
            <h1>
              Built by people who&apos;ve actually{" "}
              <span className="serif-i">placed</span> people in jobs.
            </h1>
            <p className="sub-hero-sub">
              Our team brings 40+ years of combined experience reviewing resumes
              and cover letters, coaching interviews, and placing real candidates
              into real roles. {SITE_NAME} is that hard-won playbook, turned into
              software anyone can use.
            </p>
            <div className="sub-hero-cta">
              <Link href="/login" className="btn btn-coral">
                Start free during beta
              </Link>
              <Link href="/students" className="link-underline">
                For students &amp; parents →
              </Link>
            </div>
            <div className="tier-tags">
              {STATS.map((stat) => (
                <span key={stat} className="tier-tag">
                  {stat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 720 }}>
            <span className="eyebrow">Our story</span>
            <h2>We&apos;ve read the resumes. We&apos;ve made the calls.</h2>
            <p>
              After years of reviewing thousands of resumes, rewriting cover
              letters, prepping people for interviews, and placing them into
              roles, we kept seeing the same thing: talented people losing out to
              vague bullet points, the wrong format, or a process they
              couldn&apos;t keep track of. We built {SITE_NAME} to put what we
              know — the stuff that actually gets interviews and offers — into a
              tool anyone can use.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 680 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              Why trust us
            </span>
            <h2>Decades on both sides of the hiring table.</h2>
            <p>
              This isn&apos;t a template factory. It&apos;s the judgment of people
              who&apos;ve done the reviewing, the coaching, and the hiring — built
              in.
            </p>
          </Reveal>
          <Reveal className="mgrid">
            {EXPERIENCE.map((item) => (
              <div key={item.title} className="mcard">
                <div className="top">
                  <span className="micon" aria-hidden>
                    {item.icon}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 640 }}>
            <span className="eyebrow">What we help with</span>
            <h2>The whole job search — not just a PDF.</h2>
            <p>
              Getting hired is more than a resume. We help with the full arc:
              writing it, pitching it, preparing for the conversation, and
              learning what works.
            </p>
          </Reveal>
          <Reveal className="mgrid">
            {PILLARS.map((item) => (
              <div key={item.title} className="mcard">
                <div className="top">
                  <span className="micon" aria-hidden>
                    {item.icon}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 700 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              In the works
            </span>
            <h2>Soon: a real human in your corner.</h2>
            <p>
              Software gets you most of the way — but sometimes you want a
              seasoned set of eyes. We&apos;re adding optional human review: our
              team will read your resume and cover letter and send back honest,
              specific feedback, the same way we did for the candidates we placed.
              Join the beta to be first in line.
            </p>
          </Reveal>
          <Reveal
            className="sub-hero-cta"
            style={{ marginTop: 28, justifyContent: "center" }}
          >
            <Link href="/login" className="btn btn-coral">
              Get started — be first in line
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
              <h2>Your career deserves real expertise.</h2>
              <p>
                Free during beta. Built on decades of helping people land the
                jobs they wanted.
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
