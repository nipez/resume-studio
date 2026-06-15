import Link from "next/link";
import { ScaledResumePreview } from "@/components/resume/resume-preview";
import { Reveal } from "@/components/marketing/home/reveal-on-scroll";
import { MarketingFaqAccordion } from "@/components/marketing/shared/marketing-faq-accordion";
import { MarketingPageCta } from "@/components/marketing/shared/marketing-page-cta";
import {
  BETA_BANNER,
  PRICING_PLANS,
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
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { STUDENT_SAMPLE_RESUME_DATA } from "@/lib/resume/student-sample-data";
import type { TemplateStyle } from "@/lib/types/resume";
import "@/components/marketing/home/marketing-home.css";
import "@/components/marketing/shared/marketing-subpage.css";
import "./students.css";

const TEMPLATES: { style: TemplateStyle; label: string; note: string }[] = [
  {
    style: "classic",
    label: "Classic",
    note: "Clean and familiar — great for counselors and first applications.",
  },
  {
    style: "twocol",
    label: "Two-Column",
    note: "Skills and school on the left — fits lots of activities on one page.",
  },
  {
    style: "editorial",
    label: "Editorial",
    note: "Polished serif look — strong for college supplements and internships.",
  },
];

const TESTIMONIAL_AVATARS = ["var(--coral)", "var(--teal)", "var(--ink)"];

const PARENT_REASONS = [
  {
    icon: "🚀",
    title: "A head start that compounds",
    body: "The first job, internship, or college app is often the first time a kid has to put themselves on paper. Learning to do it well now pays off for years — every future application gets easier.",
  },
  {
    icon: "📄",
    title: "A first resume that actually lands",
    body: "Clubs, sports, volunteering, and part-time jobs become real, employer-ready bullet points — not a blank page or a copied template.",
  },
  {
    icon: "✉",
    title: "Cover letters, written for them",
    body: "Short, genuine cover letters for part-time jobs, camp counselor gigs, and internships — in their own voice, not stiff corporate filler.",
  },
  {
    icon: "🎤",
    title: "Interview-ready",
    body: "Built-in interview prep turns each application into likely questions and talking points, so they walk in confident instead of winging it.",
  },
  {
    icon: "📋",
    title: "One place to stay organized",
    body: "Every application, status, and follow-up lives in one workspace — so nothing slips through the cracks during a busy senior year.",
  },
  {
    icon: "💬",
    title: "Confidence putting themselves forward",
    body: "Writing about your own strengths is a life skill. The guided steps coach them through it — a win well beyond the first job.",
  },
];

export function StudentsPage() {
  const studentPlan = PRICING_PLANS.find((plan) => plan.id === "student")!;

  return (
    <div className="marketing-home students-page">
      <section className="students-hero">
        <div className="wrap students-hero-grid">
          <div>
            <span className="eyebrow">Student plan · $2.99/mo</span>
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
                See student pricing
              </Link>
            </div>
            <p className="students-beta">{BETA_BANNER}</p>
          </div>
          <div className="students-hero-card">
            <div className="students-plan-kicker">{studentPlan.badge}</div>
            <div className="students-plan-price">
              {studentPlan.price}
              <span>{studentPlan.period}</span>
            </div>
            <p>{studentPlan.description}</p>
            <ul>
              {studentPlan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="why">
        <div className="wrap">
          <Reveal className="sec-head center" style={{ maxWidth: 760 }}>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>
              For parents
            </span>
            <h2>Why getting this right early matters.</h2>
            <p>
              Helping your kid land that first job or internship isn&apos;t just
              about one application — it&apos;s where they learn to describe what
              they&apos;ve done, write a cover letter, and prep for an interview.
              {SITE_NAME} makes it approachable and walks them through it, and
              it&apos;s far more than a resume.
            </p>
          </Reveal>
          <Reveal className="mgrid">
            {PARENT_REASONS.map((item) => (
              <div key={item.title} className="mcard">
                <div className="top">
                  <span className="micon students-spark" aria-hidden>
                    {item.icon}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </Reveal>
          <Reveal className="students-band-cta" style={{ marginTop: 32 }}>
            <Link
              href="/login?next=%2Fbuild%3Fmode%3Dstudent"
              className="btn btn-coral"
            >
              Get your kid started →
            </Link>
            <Link href="/pricing" className="link-underline">
              See student pricing
            </Link>
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
          <Reveal className="students-template-row">
            {TEMPLATES.map((template) => {
              const html = buildResumeHTML({
                templateStyle: template.style,
                data: STUDENT_SAMPLE_RESUME_DATA,
              });

              return (
                <div key={template.style} className="students-template-card">
                  <ScaledResumePreview
                    html={html}
                    title={`${template.label} student resume preview`}
                  />
                  <div className="students-template-label">{template.label}</div>
                  <p>{template.note}</p>
                </div>
              );
            })}
          </Reveal>
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
        title="Counselors & parents: share this link"
        description="$2.99/mo — less than a latte. Free during beta, and the guided builder is live today."
        secondaryHref="/pricing"
        secondaryLabel="Compare all plans →"
      />
    </div>
  );
}
