import { MarketingCta } from "@/components/marketing/marketing-cta";
import { STUDENT_HIGHLIGHTS } from "@/lib/marketing/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Students — Resume Studio",
  description:
    "Build your first resume from clubs, sports, volunteering, and honors. Guided step-by-step for high school and college students.",
};

export default function StudentsPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EEF3FF] via-page to-white" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Student plan · $2.99/mo
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Your first resume shouldn&apos;t start with a blank page and panic
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
            Honor society. Varsity captain. Food bank shifts. Debate team.
            Resume Studio turns what you&apos;ve actually done into a real
            resume — without pretending you led a division at Deloitte.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex rounded-[11px] bg-accent px-6 py-3 text-[14px] font-semibold text-white shadow-accent transition hover:bg-accent-dark"
          >
            Start guided builder →
          </Link>
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

      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold text-ink">
            What goes on a student resume
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Clubs & leadership",
              "Sports & athletics",
              "Volunteering",
              "Honors & awards",
              "Part-time jobs",
              "Internships",
              "GPA & coursework",
              "Skills & languages",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-page px-4 py-3 text-[14px] font-semibold text-ink"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingCta
        title="Counselors & parents: share this link"
        description="$2.99/mo — less than a latte. Free during beta."
      />
    </main>
  );
}
