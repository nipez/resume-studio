import Link from "next/link";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import { StudentHeroVisual } from "@/components/marketing/students/student-hero-visual";
import { StudentTemplateGallery } from "@/components/marketing/students/student-template-gallery";
import { MarketingFaqAccordion } from "@/components/marketing/shared/marketing-faq-accordion";
import { MarketingPageCta } from "@/components/marketing/shared/marketing-page-cta";
import {
  SITE_NAME,
  STUDENT_COVER_LETTER_SCENARIOS,
  STUDENT_FAQ_ITEMS,
  STUDENT_HIGHLIGHTS,
  STUDENT_PERSONAS,
  STUDENT_RESUME_SECTIONS,
  STUDENT_START_STEPS,
  STUDENT_TESTIMONIALS,
  STUDENT_USE_CASES,
} from "@/lib/marketing/content";
import "@/components/marketing/home/marketing-home.css";
import "@/components/marketing/shared/marketing-subpage.css";
import "./students.css";

const TESTIMONIAL_AVATARS = ["var(--coral)", "var(--teal)", "var(--ink)"];

const STUDENT_POINTS = [
  "Guided, plain-language steps — no blank page",
  "Turns clubs, sports, jobs & volunteering into real bullets",
  "Cover letters that sound like you",
  "Interview prep before you walk in",
];

const PARENT_POINTS = [
  "Set your kid up — or let them run with it",
  "More than a resume: cover letters, interviews & tracking",
  "Builds skills that pay off for years",
  "Stay organized through a busy senior year",
];

export function StudentsPage() {
  return (
    <div className="marketing-home students-page">
      <section className="students-hero">
        <div className="students-hero-bg" aria-hidden>
          <span className="students-hero-blob students-hero-blob-1" />
          <span className="students-hero-blob students-hero-blob-2" />
        </div>
        <div className="wrap students-hero-grid">
          <div className="students-hero-copy">
            <span className="eyebrow">For students &amp; parents · Free in beta</span>
            <h1>
              Your first resume shouldn&apos;t start with a{" "}
              <span className="serif-i">blank page</span>
            </h1>
            <p className="students-hero-sub">
              Honor society. Varsity captain. Food bank shifts. {SITE_NAME} turns
              what you&apos;ve actually done into a real resume — plus cover
              letters for part-time jobs, camp counselor gigs, and summer
              internships.
            </p>
            <ul className="students-personas">
              {STUDENT_PERSONAS.map((persona) => (
                <li key={persona}>{persona}</li>
              ))}
            </ul>
            <div className="students-hero-cta">
              <Link
                href="/login?next=%2Fbuild%3Fmode%3Dstudent"
                className="btn btn-coral"
              >
                Start guided builder →
              </Link>
              <Link href="/pricing" className="link-underline">
                See what&apos;s included
              </Link>
            </div>
            <div className="students-trust">
              <div className="students-trust-item">
                <span className="check">✓</span>
                Guided, plain-language steps
              </div>
              <div className="students-trust-item">
                <span className="check">✓</span>
                PDF export in minutes
              </div>
              <div className="students-trust-item">
                <span className="check">✓</span>
                Free while we&apos;re in beta
              </div>
            </div>
          </div>
          <StudentHeroVisual />
        </div>
        <div className="snap-strip">
          <div className="wrap inner">
            <span className="snap-saved">Sticky notes → resume</span>
            <span className="sep">·</span>
            <span>
              Turn clubs, sports, volunteering, and part-time jobs into bullets
              employers actually read.
            </span>
          </div>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 720 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              For students &amp; parents
            </span>
            <h2>Whoever&apos;s driving — we&apos;ve got you.</h2>
            <p>
              Students can do it themselves with guided, plain-language steps.
              Parents can set their kid up and follow along. Either way it&apos;s
              more than a resume — cover letters, interview prep, and tracking
              what works.
            </p>
          </Reveal>
          <Reveal className="students-audience">
            <div className="students-audience-card">
              <span className="students-audience-tag">For students</span>
              <h3>You&apos;ve done more than you think.</h3>
              <p>
                Clubs, sports, volunteering, a part-time job — we turn it into a
                real resume, one small step at a time. No blank page, no
                pretending you have ten years of experience.
              </p>
              <ul className="plan-features">
                {STUDENT_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link
                href="/login?next=%2Fbuild%3Fmode%3Dstudent"
                className="btn btn-coral"
              >
                Build my resume →
              </Link>
            </div>
            <div className="students-audience-card">
              <span className="students-audience-tag alt">For parents</span>
              <h3>Give your kid a head start.</h3>
              <p>
                Help them put their best foot forward for that first job,
                internship, or college app — and pick up skills that pay off for
                years, not just one application.
              </p>
              <ul className="plan-features">
                {PARENT_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link
                href="/login?next=%2Fbuild%3Fmode%3Dstudent"
                className="btn btn-coral"
              >
                Set my kid up →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="sec-head" style={{ maxWidth: 640 }}>
            <span className="eyebrow">Built for first resumes</span>
            <h2>No job experience? Start here.</h2>
            <p>
              Guided steps, activities-focused sections, and cover letters tuned
              for entry-level roles — not executive jargon.
            </p>
          </Reveal>
          <Reveal className="mgrid">
            {STUDENT_HIGHLIGHTS.map((item) => (
              <div key={item.title} className="mcard">
                <div className="top">
                  <span className="micon students-spark" aria-hidden>
                    ✦
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              Getting started
            </span>
            <h2>Five steps from blank page to PDF.</h2>
            <p>No guesswork, no pretending you have ten years of experience.</p>
          </Reveal>
          <Reveal className="students-steps">
            {STUDENT_START_STEPS.map((step, index) => (
              <div key={step.step} className="students-step">
                <span className="students-step-num">{step.step}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < STUDENT_START_STEPS.length - 1 ? (
                  <span className="students-step-arrow" aria-hidden>
                    →
                  </span>
                ) : null}
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
            <h2>Three templates built for students.</h2>
            <p>
              Same professional layouts as the full workspace — previewed with
              real high-school sample data.
            </p>
          </Reveal>
          <StudentTemplateGallery />
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="sec-head" style={{ maxWidth: 640 }}>
            <span className="eyebrow">Cover letters</span>
            <h2>First cover letters that don&apos;t sound fake.</h2>
            <p>
              Part-time jobs and internships often want a short letter — not a
              three-paragraph essay.
            </p>
          </Reveal>
          <Reveal className="mgrid students-cover-grid">
            {STUDENT_COVER_LETTER_SCENARIOS.map((item) => (
              <div key={item.role} className="mcard">
                <div className="top">
                  <span className="micon students-spark" aria-hidden>
                    ✉
                  </span>
                </div>
                <h3>{item.role}</h3>
                <p className="students-cover-example">{item.example}</p>
                <p>{item.tip}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head">
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              Resume sections
            </span>
            <h2>What goes on a student resume</h2>
            <p>
              You have more than you think. These sections turn activities into
              bullets employers actually read.
            </p>
          </Reveal>
          <Reveal className="students-section-tags">
            {STUDENT_RESUME_SECTIONS.map((item) => (
              <span key={item} className="students-section-tag">
                {item}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="sec-head">
            <span className="eyebrow">Use cases</span>
            <h2>Built for real student situations</h2>
          </Reveal>
          <Reveal className="mgrid students-use-grid">
            {STUDENT_USE_CASES.map((item) => (
              <div key={item.title} className="mcard">
                <h3>{item.title}</h3>
                <p>{item.scenario}</p>
                <p className="students-outcome">
                  <b>Outcome:</b> {item.outcome}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow">Real stories</span>
            <h2>From sticky notes to real resumes</h2>
          </Reveal>
          <Reveal className="tg">
            {STUDENT_TESTIMONIALS.map((testimonial, index) => (
              <div key={testimonial.name} className="quote">
                <div className="qmark">“</div>
                <p>{testimonial.quote}</p>
                <div className="who">
                  <span
                    className="avatar"
                    style={{ background: TESTIMONIAL_AVATARS[index] }}
                  >
                    {testimonial.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
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

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head center">
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              FAQ
            </span>
            <h2>Student FAQ</h2>
            <p>
              More on the{" "}
              <Link href="/faq" className="features-inline-link">
                full FAQ page
              </Link>
              .
            </p>
          </Reveal>
          <Reveal>
            <MarketingFaqAccordion items={STUDENT_FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>

      <MarketingPageCta
        title="Students, parents & counselors — start here"
        description="Free for students while we're in beta. Hurry, it's a limited-time offer."
        secondaryHref="/pricing"
        secondaryLabel="Compare all plans →"
      />
    </div>
  );
}
