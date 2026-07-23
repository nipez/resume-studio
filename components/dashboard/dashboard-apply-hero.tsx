"use client";

import { ApplyToNewJobButton } from "@/components/applications/apply-to-new-job-button";
import type { ResumeVersion } from "@/lib/resume/db-types";
import Link from "next/link";

type DashboardApplyHeroProps = {
  versions: ResumeVersion[];
  versionCounts: Record<string, number>;
  defaultVersionId: string | null;
  isStudent?: boolean;
  buildHref: string;
  hasResume: boolean;
};

export function DashboardApplyHero({
  versions,
  versionCounts,
  defaultVersionId,
  isStudent = false,
  buildHref,
  hasResume,
}: DashboardApplyHeroProps) {
  if (!hasResume) {
    return (
      <section className="animate-[fadeUp_0.35s_ease]">
        <Link
          href={buildHref}
          className="flex flex-col gap-5 rounded-2xl border border-border bg-ink px-6 py-7 text-white transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between sm:px-8"
        >
          <div className="min-w-0 max-w-[520px]">
            <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-white/55">
              Start here
            </div>
            <h2 className="mt-2 font-display text-[26px] font-semibold tracking-[-0.03em] sm:text-[28px]">
              Build your master resume first
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-white/70">
              Once it&apos;s ready, you&apos;ll copy from it and tailor a cut to each
              job description.
            </p>
          </div>
          <span className="inline-flex h-12 shrink-0 items-center justify-center rounded-[12px] bg-accent px-6 text-[15px] font-semibold text-white shadow-accent">
            Build resume →
          </span>
        </Link>
      </section>
    );
  }

  return (
    <section className="animate-[fadeUp_0.35s_ease]">
      <div className="rounded-2xl border border-border bg-ink px-6 py-7 text-white sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 max-w-[540px]">
            <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-white/55">
              Primary action
            </div>
            <h2 className="mt-2 font-display text-[26px] font-semibold tracking-[-0.03em] sm:text-[30px]">
              Apply to a role
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-white/70">
              Copy from your master resume, paste the job description, and tailor a
              version for that role — then cover letter, Q&A, and log the send.
            </p>
          </div>
          <ApplyToNewJobButton
            versions={versions}
            versionCounts={versionCounts}
            defaultVersionId={defaultVersionId}
            isStudent={isStudent}
            className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border-none bg-accent px-7 text-[15px] font-semibold text-white shadow-accent transition-transform hover:-translate-y-0.5 hover:bg-accent-dark"
          >
            Apply to a role →
          </ApplyToNewJobButton>
        </div>
      </div>
    </section>
  );
}
