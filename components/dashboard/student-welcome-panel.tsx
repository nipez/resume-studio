import Link from "next/link";
import { buildHrefForPersona } from "@/lib/profile/persona";

const STUDENT_STEPS = [
  {
    n: "1",
    title: "Build step by step",
    body: "Guided builder for clubs, sports, volunteering, and first jobs — no blank-page panic.",
    href: "/build?mode=student",
  },
  {
    n: "2",
    title: "Apply to a role",
    body: "Paste a job or internship posting. We tailor your resume and draft a cover letter.",
    href: "/tailor",
  },
  {
    n: "3",
    title: "Track what you send",
    body: "Log each application so you know what worked and what to follow up on.",
    href: "/applications",
  },
] as const;

type StudentWelcomePanelProps = {
  firstName?: string;
  compact?: boolean;
};

export function StudentWelcomePanel({
  firstName,
  compact = false,
}: StudentWelcomePanelProps) {
  const buildLink = buildHrefForPersona(true);

  return (
    <section
      className={`rounded-2xl border border-[#D9E4FF] bg-gradient-to-br from-[#F5F8FF] via-white to-[#FAFBFF] ${
        compact ? "mb-6 p-5" : "mb-7 p-6 sm:p-7"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-full bg-[#EEF3FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent">
            Welcome, student
          </span>
          <h2
            className={`mt-3 font-display font-semibold tracking-[-0.02em] text-ink ${
              compact ? "text-[20px]" : "text-[22px] sm:text-[24px]"
            }`}
          >
            {firstName ? `${firstName}, you're` : "You're"} already ahead of most
            peers
          </h2>
          <p
            className={`mt-2 max-w-[640px] leading-relaxed text-muted ${
              compact ? "text-[13.5px]" : "text-[14.5px]"
            }`}
          >
            Most students wait until they need a job to think about a resume.
            You&apos;re building yours now — that&apos;s a real edge for
            internships, part-time work, and college apps. ResumeTrakr keeps
            everything in one place so you&apos;re not juggling docs and
            guesswork.
          </p>
        </div>
        {!compact ? (
          <div className="hidden h-14 w-14 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#7A53FF] text-2xl text-white shadow-[0_8px_20px_rgba(47,107,255,0.28)] sm:flex">
            🎓
          </div>
        ) : null}
      </div>

      <div className={`mt-5 grid gap-3 ${compact ? "sm:grid-cols-1" : "sm:grid-cols-3"}`}>
        {STUDENT_STEPS.map((step) => (
          <Link
            key={step.n}
            href={step.n === "1" ? buildLink : step.href}
            className="group rounded-xl border border-[#E8ECF4] bg-white/80 px-4 py-3.5 transition-colors hover:border-[#C8D8FF] hover:bg-white"
          >
            <div className="font-display text-[11px] font-semibold text-[#9AA3AF]">
              Step {step.n}
            </div>
            <div className="mt-0.5 text-[14px] font-semibold text-ink group-hover:text-accent">
              {step.title}
            </div>
            <p className="mt-1 text-[12.5px] leading-snug text-muted">{step.body}</p>
          </Link>
        ))}
      </div>

      <p className="mt-4 text-[12.5px] text-muted">
        Stuck or want a second pair of eyes?{" "}
        <span className="font-semibold text-ink">Help is coming soon</span> — a
        quick way to ask questions, request features, or book a human resume
        review.
      </p>
    </section>
  );
}
