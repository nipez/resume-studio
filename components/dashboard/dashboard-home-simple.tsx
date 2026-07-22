"use client";

import { SuggestedFollowUpsSection } from "@/components/applications/suggested-follow-ups-section";
import {
  type DashboardHomeData,
  buildHref,
  ChecklistSection,
  StatCard,
  UpcomingSection,
} from "@/components/dashboard/dashboard-shared";
import { FirstRunPathPicker } from "@/components/dashboard/first-run-path-picker";
import { StudentWelcomePanel } from "@/components/dashboard/student-welcome-panel";
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
    suggestedFollowUps,
    recentVersions,
    savedJobs,
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
      <div className="mx-auto max-w-[760px] px-5 pb-16 sm:px-8 lg:px-12 pt-7">
        <div className="mb-7">
          {isStudent && onboardingPersonaSet ? (
            <span className="mb-2 inline-flex rounded-full bg-[#E8FBF8] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal-dark">
              Student mode
            </span>
          ) : null}
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
            {hasResume
              ? `Welcome back${firstName ? `, ${firstName}` : ""}`
              : `Hi${firstName ? ` ${firstName}` : ""} — let's get started`}
          </h1>
          <p className="mt-2 max-w-[520px] text-[14.5px] leading-relaxed text-muted">
            {!hasResume
              ? isStudent
                ? "You're getting ahead — let's build your first resume, then apply and track."
                : "We'll keep this simple. One resume, one job application at a time."
              : !hasApplication
                ? isStudent
                  ? "Next: paste a job posting, tailor your resume, and track what you send."
                  : "Your resume is ready. Next up: apply to a job and track what you sent."
                : "Your search is underway. Apply to more roles or see what's getting responses."}
          </p>
        </div>

        {isStudent && !hasResume && !showPathPicker ? (
          <StudentWelcomePanel firstName={firstName || undefined} compact />
        ) : null}

        {showPathPicker ? (
          <FirstRunPathPicker isStudent={isStudent} />
        ) : !hasResume ? (
          <Link
            href={buildLink}
            className="mb-6 flex items-center gap-4 rounded-2xl border border-dashed border-[#9DE4DB] bg-[#F3FBFA] px-5 py-5 transition-shadow hover:shadow-soft"
          >
            <div className="min-w-0 flex-1">
              <div className="font-display text-[16px] font-semibold text-ink">
                {isStudent
                  ? "Continue building your resume"
                  : "Build your first resume"}
              </div>
              <div className="mt-1 text-[13px] leading-relaxed text-muted">
                {isStudent
                  ? "Pick up where you left off in the guided builder."
                  : "Step-by-step guided builder — easier than starting from scratch."}
              </div>
            </div>
            <div className="flex-none whitespace-nowrap rounded-xl bg-accent px-4 py-2.5 text-[13px] font-semibold text-white">
              Open builder →
            </div>
          </Link>
        ) : !hasApplication ? (
          <Link
            href="/tailor"
            className="mb-6 flex items-center gap-4 rounded-2xl border border-dashed border-[#9DE4DB] bg-[#F3FBFA] px-5 py-5 transition-shadow hover:shadow-soft"
          >
            <div className="min-w-0 flex-1">
              <div className="font-display text-[16px] font-semibold text-ink">
                {isStudent
                  ? "Apply to a job or internship"
                  : "Apply to your first job"}
              </div>
              <div className="mt-1 text-[13px] leading-relaxed text-muted">
                Paste a job description — we&apos;ll tailor your resume, draft a cover
                letter, and help you log what you sent.
              </div>
            </div>
            <div className="flex-none whitespace-nowrap rounded-xl bg-accent px-4 py-2.5 text-[13px] font-semibold text-white">
              Start applying →
            </div>
          </Link>
        ) : (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Resumes" value={String(versionsCount)} />
            <StatCard label="Applications" value={String(applicationsCount)} />
            {stats.respRate > 0 ? (
              <StatCard label="Response rate" value={`${stats.respRate}%`} />
            ) : null}
          </div>
        )}

        {hasResume && savedJobs.length > 0 ? (
          <section className="mb-5 rounded-2xl border border-border bg-white px-5 py-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-[14px] font-semibold text-ink">
                Apply today
              </h2>
              <Link
                href="/applications"
                className="text-[12.5px] font-semibold text-accent hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {savedJobs.slice(0, 2).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#EEF0F3] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-ink">
                      {job.role || "Untitled role"}
                    </div>
                    <div className="truncate text-[12px] text-muted">
                      {job.company || "Add company"}
                    </div>
                  </div>
                  <Link
                    href="/applications"
                    className="shrink-0 text-[12px] font-semibold text-accent hover:underline"
                  >
                    Prepare
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <ChecklistSection
          title="Your next steps"
          subtitle={subtitle}
          items={checklist}
        />

        {hasResume && recentVersions[0] ? (
          <p className="mt-5 text-center text-[13px] text-muted">
            Latest doc:{" "}
            <Link
              href={`/editor/${recentVersions[0].id}`}
              className="font-semibold text-accent hover:underline"
            >
              {recentVersions[0].name}
            </Link>
            {" · "}
            <Link href="/library" className="font-semibold text-accent hover:underline">
              All documents
            </Link>
            {primaryVersionId && primaryVersionId !== recentVersions[0].id ? (
              <>
                {" · "}
                <Link
                  href={`/editor/${primaryVersionId}`}
                  className="font-semibold text-accent hover:underline"
                >
                  Open editor
                </Link>
              </>
            ) : null}
          </p>
        ) : null}

        {upcoming.length > 0 ? (
          <div className="mt-5">
            <UpcomingSection upcoming={upcoming} />
          </div>
        ) : null}

        {suggestedFollowUps.length > 0 ? (
          <div className="mt-5">
            <SuggestedFollowUpsSection items={suggestedFollowUps} compact />
          </div>
        ) : null}
      </div>
    </div>
  );
}
