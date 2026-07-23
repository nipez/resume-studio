import Link from "next/link";
import { SuggestedFollowUpsSection } from "@/components/applications/suggested-follow-ups-section";
import { DashboardApplyHero } from "@/components/dashboard/dashboard-apply-hero";
import {
  type ChecklistItem,
  type DashboardHomeData,
  ChecklistSection,
  UpcomingSection,
  buildHref,
  formatShortDate,
} from "@/components/dashboard/dashboard-shared";
import { StudentWelcomePanel } from "@/components/dashboard/student-welcome-panel";
import { formatRelativeTime } from "@/lib/resume/utils";

/** Shared right rail so purple CTAs share one vertical edge across sections. */
const CTA_RAIL = "w-[132px] shrink-0";
const CTA_BTN =
  "inline-flex h-10 w-full items-center justify-center rounded-[10px] bg-accent text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-dark";

function buildChecklist(data: DashboardHomeData): ChecklistItem[] {
  const { isStudent, versionsCount, applicationsCount, hasTailored, primaryVersionId } =
    data;
  const buildLink = buildHref(isStudent);

  return [
    {
      label: isStudent ? "Upload or build your resume" : "Upload your resume",
      done: versionsCount > 0,
      href:
        versionsCount > 0 && primaryVersionId
          ? `/editor/${primaryVersionId}`
          : buildLink,
      cta: "Build",
    },
    {
      label: isStudent ? "Apply to a role" : "Apply to a role (tailor from master)",
      done: hasTailored || applicationsCount > 0,
      href: "/tailor?new=1",
      cta: "Apply",
    },
    {
      label: "Track the application you sent",
      done: applicationsCount > 0,
      href: "/applications",
      cta: "Track",
    },
    {
      label: "Find more roles worth applying to",
      done: data.savedJobs.length > 0 || applicationsCount > 0,
      href: "/discover",
      cta: "Find",
    },
  ];
}

function SectionHeading({
  title,
  linkHref,
  linkLabel,
}: {
  title: string;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      {linkHref && linkLabel ? (
        <Link
          href={linkHref}
          className="text-[13px] font-medium text-teal-dark hover:underline"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function DashboardHomeFull({ data }: { data: DashboardHomeData }) {
  const {
    firstName,
    isStudent,
    versionsCount,
    applicationsCount,
    primaryVersionId,
    versions,
    versionCounts,
    upcoming,
    suggestedFollowUps,
    recentVersions,
    savedJobs,
    prepCandidates,
  } = data;

  const buildLink = buildHref(isStudent);
  const isNew = versionsCount === 0;
  const checklist = buildChecklist(data);
  const applyQueue = savedJobs.slice(0, 4);
  const docs = recentVersions.slice(0, 5);

  return (
    <div className="scroll flex-1 overflow-auto bg-page">
      <div className="mx-auto max-w-[1180px] px-5 pb-20 pt-9 sm:px-8 lg:px-10">
        <div className="mb-7 animate-[fadeUp_0.35s_ease]">
          <h1 className="font-display text-[32px] font-semibold tracking-[-0.035em] text-ink">
            {isNew
              ? `Hi${firstName ? ` ${firstName}` : ""}`
              : `Welcome back${firstName ? `, ${firstName}` : ""}`}
          </h1>
          <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-muted">
            {isNew
              ? "Build a master resume once — then tailor a cut for every role you apply to."
              : "Apply to a role: copy from your master resume, tailor to the job description, and track what you send."}
          </p>
        </div>

        {isStudent && isNew ? (
          <div className="mb-8">
            <StudentWelcomePanel firstName={firstName || undefined} />
          </div>
        ) : null}

        <div className="mb-9">
          <DashboardApplyHero
            versions={versions}
            versionCounts={versionCounts}
            defaultVersionId={primaryVersionId}
            isStudent={isStudent}
            buildHref={buildLink}
            hasResume={!isNew}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10">
          <div className="min-w-0 space-y-9">
            <section className="animate-[fadeUp_0.45s_ease]">
              <SectionHeading
                title="Apply today"
                linkHref="/applications"
                linkLabel="Open tracker"
              />
              {applyQueue.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D5D9E0] bg-soft px-5 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-ink">
                        Add your first job
                      </div>
                      <p className="mt-1 max-w-[400px] text-[13.5px] leading-relaxed text-muted">
                        Save a role to your queue, tailor a resume cut, then log what
                        you send.
                      </p>
                    </div>
                    <div className={`${CTA_RAIL} flex justify-end self-end sm:self-center`}>
                      <Link
                        href="/applications"
                        className="inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-accent/30 bg-white text-[13.5px] font-semibold text-accent transition-colors hover:bg-[#F5F2FF]"
                      >
                        + Add job
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_0_rgba(26,29,35,0.03)]">
                  {applyQueue.map((job, index) => (
                    <div
                      key={job.id}
                      className={`flex items-center gap-4 px-5 py-3.5 ${
                        index < applyQueue.length - 1 ? "border-b border-[#F0F1F3]" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14.5px] font-semibold text-ink">
                          {job.role || "Untitled role"}
                        </div>
                        <div className="truncate text-[13px] text-muted">
                          {job.company || "Add company"}
                        </div>
                      </div>
                      <div className={`${CTA_RAIL} flex justify-end`}>
                        <Link href="/applications" className={CTA_BTN}>
                          Prepare
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="animate-[fadeUp_0.48s_ease]">
              <SectionHeading
                title="Find more jobs"
                linkHref="/discover"
                linkLabel="Open discovery"
              />
              <div className="rounded-2xl border border-dashed border-[#9DE4DB] bg-[#F3FBFA] px-5 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[16px] font-semibold tracking-[-0.015em] text-ink">
                      Need roles to apply to?
                    </h3>
                    <p className="mt-1 max-w-[440px] text-[13.5px] leading-relaxed text-muted">
                      Plan targets and searches — then come back here to tailor from
                      your master resume.
                    </p>
                  </div>
                  <div className={`${CTA_RAIL} flex justify-end self-end sm:self-center`}>
                    <Link href="/discover" className={CTA_BTN}>
                      Find jobs
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="animate-[fadeUp_0.5s_ease]">
              <SectionHeading title="Documents" linkHref="/library" linkLabel="All documents" />
              {docs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D5D9E0] bg-white px-5 py-5">
                  <div className="mb-4 flex justify-end">
                    <div className={CTA_RAIL}>
                      <Link
                        href={primaryVersionId ? `/editor/${primaryVersionId}` : buildLink}
                        className={CTA_BTN}
                      >
                        + Create
                      </Link>
                    </div>
                  </div>
                  <p className="py-6 text-center text-[14px] text-muted">
                    No documents yet.{" "}
                    <Link href={buildLink} className="font-semibold text-accent hover:underline">
                      Build your first resume
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_0_rgba(26,29,35,0.03)]">
                  <div className="flex items-center gap-4 border-b border-[#F0F1F3] px-5 py-3">
                    <div className="min-w-0 flex-1 text-[13px] text-muted">
                      {docs.length} resume{docs.length === 1 ? "" : "s"}
                    </div>
                    <div className={`${CTA_RAIL} flex justify-end`}>
                      <Link
                        href={primaryVersionId ? `/editor/${primaryVersionId}` : buildLink}
                        className={CTA_BTN}
                      >
                        + Create
                      </Link>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                  <div className="min-w-[680px]">
                    <div className="grid grid-cols-[1.5fr_1.1fr_88px_120px_120px] gap-3 border-b border-[#F0F1F3] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#9AA3AF]">
                      <div>Name</div>
                      <div>Job</div>
                      <div>Type</div>
                      <div>Created</div>
                      <div>Last edit</div>
                    </div>
                    {docs.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/editor/${doc.id}`}
                        className="grid grid-cols-[1.5fr_1.1fr_88px_120px_120px] items-center gap-3 border-b border-[#F5F6F8] px-5 py-3.5 last:border-b-0 transition-colors hover:bg-soft"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[#F0ECFF] text-[12px] text-accent"
                            aria-hidden
                          >
                            ▤
                          </span>
                          <span className="truncate text-[14px] font-medium text-ink">
                            {doc.name}
                          </span>
                        </div>
                        <div className="truncate text-[13px] text-muted">
                          {doc.tailoredLabel || (
                            <span className="font-medium text-accent">+ Add</span>
                          )}
                        </div>
                        <div className="text-[13px] text-muted">Resume</div>
                        <div className="text-[13px] text-muted">
                          {formatShortDate(doc.createdAt)}
                        </div>
                        <div className="text-[13px] text-[#9AA3AF]">
                          {formatRelativeTime(doc.updatedAt)}
                        </div>
                      </Link>
                    ))}
                  </div>
                  </div>
                </div>
              )}
            </section>

            {prepCandidates.length > 0 || applicationsCount > 0 ? (
              <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_0_rgba(26,29,35,0.03)] animate-[fadeUp_0.55s_ease]">
                <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="border-b border-[#F0F1F3] px-7 py-8 lg:border-b-0 lg:border-r">
                    <h2 className="font-display text-[26px] font-semibold tracking-[-0.035em] text-ink">
                      Two steps. Interview{" "}
                      <span className="text-accent">ready.</span>
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">
                      Get a personalized prep guide from a logged application.
                    </p>
                    <ul className="mt-5 space-y-2.5 text-[13.5px] text-[#3a4350]">
                      {[
                        "Concise company overview",
                        "STAR storylines",
                        "Key talking points",
                        "Practice questions",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2.5">
                          <span className="text-teal">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-center px-6 py-8">
                    <div className="mb-3 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9AA3AF]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0ECFF] text-[12px] text-accent">
                        1
                      </span>
                      Select a job
                    </div>
                    {prepCandidates.length > 0 ? (
                      <div className="space-y-2">
                        {prepCandidates.slice(0, 3).map((app) => (
                          <Link
                            key={app.id}
                            href={`/applications/${app.id}?tab=prep`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border px-3.5 py-3 transition-colors hover:border-accent/35 hover:bg-[#FBFAFF]"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-[13.5px] font-semibold text-ink">
                                {app.role || "Untitled role"}
                              </div>
                              <div className="truncate text-[12px] text-muted">
                                {app.company || "Company"}
                                {app.hasPrep ? " · Prep ready" : ""}
                              </div>
                            </div>
                            <span className="shrink-0 text-[12px] font-semibold text-accent">
                              Open →
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-[#D5D9E0] bg-soft px-4 py-5 text-[13px] text-muted">
                        Log an application first, then generate interview prep.
                        <Link
                          href="/applications"
                          className="mt-2 block font-semibold text-accent hover:underline"
                        >
                          Go to job tracker →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : null}

            {upcoming.length > 0 ? <UpcomingSection upcoming={upcoming} /> : null}
            {suggestedFollowUps.length > 0 ? (
              <SuggestedFollowUpsSection items={suggestedFollowUps} compact />
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start animate-[fadeUp_0.45s_ease]">
            <ChecklistSection title="Get started" items={checklist} compact />
            <section className="rounded-2xl border border-[#D9D2FF] bg-[#F7F5FF] p-5">
              <h3 className="text-[15px] font-semibold text-ink">Get Pro</h3>
              <ul className="mt-3 space-y-2 text-[13px] text-[#3a4350]">
                <li className="flex gap-2">
                  <span className="text-teal">✓</span>
                  Higher AI tailor limits
                </li>
                <li className="flex gap-2">
                  <span className="text-teal">✓</span>
                  Job discovery planning
                </li>
                <li className="flex gap-2">
                  <span className="text-teal">✓</span>
                  Interview prep & insights
                </li>
              </ul>
              <Link
                href="/pricing"
                className="mt-4 flex w-full items-center justify-center rounded-full bg-teal px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-teal-dark"
              >
                Upgrade to Pro
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
