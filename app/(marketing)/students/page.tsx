import { MarketingCta } from "@/components/marketing/marketing-cta";
import { GlowCard } from "@/components/marketing/primitives";
import { StudentCoverLetters } from "@/components/marketing/student-cover-letters";
import { StudentFaq } from "@/components/marketing/student-faq";
import { StudentPricingCta } from "@/components/marketing/student-pricing-cta";
import { StudentStartPath } from "@/components/marketing/student-start-path";
import { StudentTemplateGallery } from "@/components/marketing/student-template-gallery";
import { StudentTestimonials } from "@/components/marketing/student-testimonials";
import { StudentUseCases } from "@/components/marketing/student-use-cases";
import {
  BETA_BANNER,
  SITE_NAME,
  STUDENT_HIGHLIGHTS,
  STUDENT_PERSONAS,
  STUDENT_RESUME_SECTIONS,
} from "@/lib/marketing/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Students — First Resume & Cover Letter Builder | ${SITE_NAME}`,
  description:
    "High school and college students: build your first resume from clubs, sports, volunteering, and honors. Three templates, guided builder, cover letters for part-time jobs and internships. $2.99/mo — free during beta.",
  openGraph: {
    title: `Students — ${SITE_NAME}`,
    description:
      "Your first resume shouldn't start with a blank page. Guided builder, student templates, and cover letters for part-time jobs and internships.",
  },
};

export default function StudentsPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF4E6] via-[#FFFBF5] to-[#EEF3FF]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-[#F59E0B]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-accent/8 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/25 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#D97706] backdrop-blur-sm">
            <span aria-hidden>✦</span>
            Student plan · $2.99/mo · {BETA_BANNER.split("—")[0].trim()}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
            Your first resume shouldn&apos;t start with a blank page and panic
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
            Honor society. Varsity captain. Food bank shifts. Debate team.
            {SITE_NAME} turns what you&apos;ve actually done into a real
            resume — plus cover letters for part-time jobs, camp counselor
            gigs, and summer internships.
          </p>

          <ul className="mt-7 flex flex-wrap gap-2">
            {STUDENT_PERSONAS.map((persona) => (
              <li
                key={persona}
                className="rounded-full border border-[#F59E0B]/20 bg-white/80 px-3.5 py-1.5 text-[12px] font-medium text-[#92400E] shadow-sm backdrop-blur-sm transition hover:border-[#F59E0B]/40"
              >
                {persona}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex rounded-[11px] bg-accent px-6 py-3.5 text-[14px] font-semibold text-white shadow-accent transition hover:bg-accent-dark hover:shadow-[0_6px_24px_rgba(47,107,255,0.4)]"
            >
              Start guided builder →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-[11px] border border-border bg-white/80 px-6 py-3.5 text-[14px] font-semibold text-ink backdrop-blur-sm transition hover:border-accent hover:text-accent"
            >
              See student pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {STUDENT_HIGHLIGHTS.map((item, i) => (
            <GlowCard
              key={item.title}
              className={`border-[#F59E0B]/10 bg-gradient-to-br from-white to-[#FFFBF5] p-7 ${i === 1 ? "md:-mt-4" : ""}`}
            >
              <span className="text-xl text-[#F59E0B]" aria-hidden>
                ✦
              </span>
              <h2 className="mt-3 font-display text-xl font-semibold text-ink">
                {item.title}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {item.description}
              </p>
            </GlowCard>
          ))}
        </div>
      </section>

      <StudentStartPath />
      <StudentTemplateGallery />
      <StudentCoverLetters />

      <section className="border-y border-border bg-gradient-to-b from-[#FFFBF5] to-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            What goes on a student resume
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            You have more than you think. These sections turn activities into
            bullets employers and admissions offices actually read.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STUDENT_RESUME_SECTIONS.map((item, i) => (
              <div
                key={item}
                className="rounded-xl border border-[#F59E0B]/15 bg-white px-4 py-4 text-[14px] font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-[#F59E0B]/30 hover:shadow-md"
                style={{ marginTop: i % 2 === 1 ? "0.5rem" : "0" }}
              >
                <span className="mr-2 text-[#F59E0B]" aria-hidden>
                  •
                </span>
                {item}
              </div>
            ))}
          </div>
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
