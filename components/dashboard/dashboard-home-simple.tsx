"use client";

import {
  type DashboardHomeData,
  buildHref,
  ChecklistSection,
  StatCard,
  UpcomingSection,
} from "@/components/dashboard/dashboard-shared";
import { FirstRunPathPicker } from "@/components/dashboard/first-run-path-picker";
import Link from "next/link";

export function DashboardHomeSimple({ data }: { data: DashboardHomeData }) {
  const {
    firstName,
    isStudent,
    onboardingPersonaSet,
    versionsCount,
    applicationsCount,
    hasTailored,
    primaryVersionId,
    stats,
    upcoming,
  } = data;

  const buildLink = buildHref(isStudent);
  const hasResume = versionsCount > 0;
  const hasApplication = applicationsCount > 0;
  const showPathPicker = !hasResume && !onboardingPersonaSet;

  const checklist = !hasResume
    ? [
        {
          label: isStudent
            ? "Build your first resume"
            : "Create your first resume",
          done: false,
          href: buildLink,
          cta: "Build",
        },
        {
          label: isStudent
            ? "Apply to a part-time job or internship"
            : "Apply to your first job",
          done: false,
          href: "/tailor",
          cta: "Apply",
        },
      ]
    : !hasApplication
      ? [
          {
            label: isStudent
              ? "Tailor for a job or internship"
              : "Tailor your resume to a job",
            done: hasTailored,
            href: "/tailor",
            cta: "Tailor",
          },
          {
            label: "Log your first application",
            done: false,
            href: "/applications",
            cta: "Log it",
          },
        ]
      : [
          {
            label: isStudent ? "Apply to another role" : "Keep applying",
            done: true,
            href: "/tailor",
            cta: "Apply again",
          },
          {
            label: "Review what's working",
            done: true,
            href: "/insights",
            cta: "Insights",
          },
        ];

  const subtitle = !hasResume
    ? isStudent
      ? "Two steps: your first resume, then an application."
      : "Two steps: resume first, then your first application."
    : !hasApplication
      ? isStudent
        ? "Resume ready — tailor it for a job posting and log what you send."
        : "You have a resume — now match it to a job and log the send."
      : "You're tracking applications. Keep going or check Insights.";

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[720px] px-12 pb-16 pt-[42px]">
        <div className="mb-8">
          {isStudent && onboardingPersonaSet ? (
            <span className="mb-2 inline-flex rounded-full bg-[#EEF3FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent">
              Student mode
            </span>
          ) : null}
          <h1 className="font-display text-[30px] font-semibold tracking-[-0.025em] text-ink">
            {hasResume
              ? `Welcome back${firstName ? `, ${firstName}` : ""}`
              : `Hi${firstName ? ` ${firstName}` : ""} — let's get started`}
          </h1>
          <p className="mt-2 max-w-[520px] text-[14.5px] leading-relaxed text-muted">
            {!hasResume
              ? isStudent
                ? "Built for first resumes — clubs, sports, volunteering, and part-time jobs."
                : "We'll keep this simple. One resume, one job application at a time."
              : !hasApplication
                ? isStudent
                  ? "Next: paste a job posting, tailor your resume, and track what you send."
                  : "Your resume is ready. Next up: apply to a job and track what you sent."
                : "Your search is underway. Apply to more roles or see what's getting responses."}
          </p>
        </div>

        {showPathPicker ? (
          <FirstRunPathPicker isStudent={isStudent} />
        ) : !hasResume ? (
          <Link
            href={buildLink}
            className="mb-7 flex items-center gap-[18px] rounded-2xl bg-gradient-to-br from-sidebar to-[#1b2740] px-[24px] py-[22px] text-white transition-shadow hover:shadow-[0_14px_36px_rgba(15,17,22,0.22)]"
          >
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px] bg-gradient-to-br from-accent to-[#7A53FF] text-[23px] shadow-[0_6px_18px_rgba(47,107,255,0.4)]">
              ✎
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[16.5px] font-semibold">
                {isStudent
                  ? "Continue building your resume"
                  : "Build your first resume"}
              </div>
              <div className="mt-[3px] text-[13.3px] leading-[1.5] text-[#AEB6C2]">
                {isStudent
                  ? "Pick up where you left off in the guided builder."
                  : "Step-by-step guided builder — easier than starting from scratch."}
              </div>
            </div>
            <div className="flex-none whitespace-nowrap rounded-[11px] bg-white px-[18px] py-[11px] text-[13.5px] font-semibold text-ink">
              Open builder →
            </div>
          </Link>
        ) : !hasApplication ? (
          <Link
            href="/tailor"
            className="mb-7 flex items-center gap-[18px] rounded-2xl bg-gradient-to-br from-sidebar to-[#1b2740] px-[24px] py-[22px] text-white transition-shadow hover:shadow-[0_14px_36px_rgba(15,17,22,0.22)]"
          >
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px] bg-gradient-to-br from-accent to-[#7A53FF] text-[23px] shadow-[0_6px_18px_rgba(47,107,255,0.4)]">
              ◎
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[16.5px] font-semibold">
                {isStudent
                  ? "Apply to a job or internship"
                  : "Apply to your first job"}
              </div>
              <div className="mt-[3px] text-[13.3px] leading-[1.5] text-[#AEB6C2]">
                Paste a job description — we&apos;ll tailor your resume, draft a cover
                letter, and help you log what you sent.
              </div>
            </div>
            <div className="flex-none whitespace-nowrap rounded-[11px] bg-white px-[18px] py-[11px] text-[13.5px] font-semibold text-ink">
              Start applying →
            </div>
          </Link>
        ) : (
          <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Resumes" value={String(versionsCount)} />
            <StatCard label="Applications" value={String(applicationsCount)} />
            {stats.respRate > 0 ? (
              <StatCard label="Response rate" value={`${stats.respRate}%`} />
            ) : null}
          </div>
        )}

        <ChecklistSection
          title="Your next steps"
          subtitle={subtitle}
          items={checklist}
        />

        {hasResume && primaryVersionId ? (
          <p className="mt-5 text-center text-[13px] text-muted">
            Need to edit your resume?{" "}
            <Link
              href={`/editor/${primaryVersionId}`}
              className="font-semibold text-accent hover:underline"
            >
              Open editor
            </Link>
            {" · "}
            <Link href="/library" className="font-semibold text-accent hover:underline">
              Resume library
            </Link>
          </p>
        ) : null}

        {upcoming.length > 0 ? (
          <div className="mt-5">
            <UpcomingSection upcoming={upcoming} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
