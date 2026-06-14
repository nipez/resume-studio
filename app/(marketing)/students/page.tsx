import { MarketingCta } from "@/components/marketing/marketing-cta";
import { StudentCoverLetters } from "@/components/marketing/student-cover-letters";
import { StudentFaq } from "@/components/marketing/student-faq";
import { StudentPricingCta } from "@/components/marketing/student-pricing-cta";
import { StudentStartPath } from "@/components/marketing/student-start-path";
import { StudentTemplateGallery } from "@/components/marketing/student-template-gallery";
import { StudentTestimonials } from "@/components/marketing/student-testimonials";
import { StudentUseCases } from "@/components/marketing/student-use-cases";
import {
  BETA_BANNER,
  STUDENT_HIGHLIGHTS,
  STUDENT_PERSONAS,
  STUDENT_RESUME_SECTIONS,
} from "@/lib/marketing/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Students — First Resume & Cover Letter Builder | Resume Studio",
  description:
    "High school and college students: build your first resume from clubs, sports, volunteering, and honors. Three templates, guided builder, cover letters for part-time jobs and internships. $2.99/mo — free during beta.",
  openGraph: {
    title: "Students — Resume Studio",
    description:
      "Your first resume shouldn't start with a blank page. Guided builder, student templates, and cover letters for part-time jobs and internships.",
  },
};

export default function StudentsPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EEF3FF] via-page to-white" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Student plan · $2.99/mo · {BETA_BANNER.split("—")[0].trim()}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Your first resume shouldn&apos;t start with a blank page and panic
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
            Honor society. Varsity captain. Food bank shifts. Debate team.
            Resume Studio turns what you&apos;ve actually done into a real
            resume — plus cover letters for part-time jobs, camp counselor
            gigs, and summer internships.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {STUDENT_PERSONAS.map((persona) => (
              <li
                key={persona}
                className="rounded-full border border-border bg-white/80 px-3 py-1.5 text-[12px] font-medium text-muted backdrop-blur-sm"
              >
                {persona}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex rounded-[11px] bg-accent px-6 py-3 text-[14px] font-semibold text-white shadow-accent transition hover:bg-accent-dark"
            >
              Start guided builder →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-[11px] border border-border bg-white px-6 py-3 text-[14px] font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              See student pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {STUDENT_HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-white p-7 shadow-[0_8px_26px_rgba(15,17,22,0.04)]"
            >
              <h2 className="font-display text-xl font-semibold text-ink">
                {item.title}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <StudentStartPath />
      <StudentTemplateGallery />
      <StudentCoverLetters />

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          What goes on a student resume
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          You have more than you think. These sections turn activities into
          bullets employers and admissions offices actually read.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STUDENT_RESUME_SECTIONS.map((item) => (
            <div
              key={item}
              className="rounded-xl border border-border bg-page px-4 py-3 text-[14px] font-semibold text-ink"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <StudentUseCases />
      <StudentTestimonials />
      <StudentPricingCta />
      <StudentFaq />

      <MarketingCta
        title="Counselors & parents: share this link"
        description="$2.99/mo — less than a latte. Free during beta. Guided builder launching soon."
      />
    </main>
  );
}
