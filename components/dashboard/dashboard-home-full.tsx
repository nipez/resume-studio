import Link from "next/link";
import { SuggestedFollowUpsSection } from "@/components/applications/suggested-follow-ups-section";
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

function buildChecklist(data: DashboardHomeData): ChecklistItem[] {
  const { isStudent, versionsCount, applicationsCount, hasTailored, primaryVersionId } =
    data;
  const buildLink = buildHref(isStudent);

  if (isStudent) {
    return [
      {
        label: "Upload or build your resume",
        done: versionsCount > 0,
        href:
          versionsCount > 0 && primaryVersionId
            ? `/editor/${primaryVersionId}`
            : buildLink,
        cta: "Build",
      },
      {
        label: "Find a job worth applying to",
        done: data.savedJobs.length > 0 || applicationsCount > 0,
        href: "/discover",
        cta: "Find",
      },
      {
        label: "Tailor for a role",
        done: hasTailored,
        href: "/tailor",
        cta: "Tailor",
      },
      {
        label: "Log your first application",
        done: applicationsCount > 0,
        href: "/applications",
        cta: "Log",
      },
    ];
  }

  return [
    {
      label: "Upload your resume",
      done: versionsCount > 0,
      href:
        versionsCount > 0 && primaryVersionId
          ? `/editor/${primaryVersionId}`
          : buildLink,
      cta: "Build",
    },
    {
      label: "Find jobs that match",
      done: data.savedJobs.length > 0 || applicationsCount > 0,
      href: "/discover",
      cta: "Find",
    },
    {
      label: "Tailor a version to a job",
      done: hasTailored,
      href: "/tailor",
      cta: "Tailor",
    },
    {
      label: "Track your first application",
      done: applicationsCount > 0,
      href: "/applications",
      cta: "Track",
    },
  ];
}

export function DashboardHomeFull({ data }: { data: DashboardHomeData }) {
  const {
    firstName,
    isStudent,
    versionsCount,
    applicationsCount,
    primaryVersionId,
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
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1180px] px-5 pb-16 sm:px-8 lg:px-12 pt-7">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
              {isStudent && isNew
                ? `Hi${firstName ? ` ${firstName}` : ""}`
                : `Welcome back${firstName ? `, ${firstName}` : ""}`}
            </h1>
            <p className="mt-1.5 max-w-[560px] text-[14px] leading-relaxed text-muted">
              {isNew
                ? "Start with a resume, then find roles and track every send."
                : "Find roles, tailor what you send, and keep every application in one place."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/discover"
              className="inline-flex rounded-[11px] border border-[#DCE0E6] bg-white px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-[#F4F5F7]"
            >
              Find jobs
            </Link>
            <Link
              href={versionsCount > 0 ? "/tailor?new=1" : buildLink}
              className="inline-flex rounded-[11px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-accent-dark"
            >
              {versionsCount > 0 ? "Apply to a job" : "Build resume"}
            </Link>
          </div>
        </div>

        {isStudent && isNew ? (
          <div className="mb-6">
            <StudentWelcomePanel firstName={firstName || undefined} />
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-6">
            {/* Find jobs band */}
            <section>
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <h2 className="font-display text-[16px] font-semibold text-ink">
                  New jobs
                </h2>
                <Link
                  href="/discover"
                  className="text-[13px] font-semibold text-accent hover:underline"
                >
                  Explore more jobs →
                </Link>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-[#B8D0FF] bg-gradient-to-br from-[#F3F7FF] via-[#F8FAFF] to-white px-6 py-7 sm:px-8">
                <div
                  className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#2F6BFF]/10 blur-2xl"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-[480px]">
                    <h3 className="font-display text-[20px] font-semibold tracking-[-0.02em] text-ink">
                      Find jobs that match your experience
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                      Describe the role you want — we&apos;ll suggest companies and
                      search strings you can validate yourself.
                    </p>
                  </div>
                  <Link
                    href={isNew ? buildLink : "/discover"}
                    className="inline-flex shrink-0 items-center justify-center rounded-[11px] bg-accent px-5 py-3 text-[13.5px] font-semibold text-white shadow-[0_6px_18px_rgba(47,107,255,0.28)] transition-transform hover:-translate-y-0.5 hover:bg-accent-dark"
                  >
                    {isNew ? "Upload resume" : "Find jobs"}
                  </Link>
                </div>
              </div>
            </section>

            {/* Apply today */}
            <section>
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <h2 className="font-display text-[16px] font-semibold text-ink">
                  Apply today
                </h2>
                <Link
                  href="/applications"
                  className="text-[13px] font-semibold text-accent hover:underline"
                >
                  Open job tracker →
                </Link>
              </div>
              {applyQueue.length === 0 ? (
                <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-display text-[15px] font-semibold text-ink">
                      Add your first job
                    </div>
                    <p className="mt-1 max-w-[420px] text-[13px] leading-relaxed text-muted">
                      Save a role to your queue, tailor a resume cut, then log what
                      you send.
                    </p>
                  </div>
                  <Link
                    href="/applications"
                    className="inline-flex shrink-0 items-center justify-center rounded-[11px] border border-accent/35 bg-white px-4 py-2.5 text-[13px] font-semibold text-accent transition-colors hover:bg-[#F5F8FF]"
                  >
                    + Add job
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-white">
                  {applyQueue.map((job, index) => (
                    <div
                      key={job.id}
                      className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${
                        index < applyQueue.length - 1 ? "border-b border-[#F2F3F5]" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-semibold text-ink">
                          {job.role || "Untitled role"}
                        </div>
                        <div className="truncate text-[12.5px] text-muted">
                          {job.company || "Add company"}
                        </div>
                      </div>
                      <Link
                        href="/applications"
                        className="shrink-0 rounded-[9px] bg-accent px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-accent-dark"
                      >
                        Prepare
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Documents */}
            <section>
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-[16px] font-semibold text-ink">
                  Documents
                </h2>
                <div className="flex items-center gap-3">
                  <Link
                    href="/library"
                    className="text-[13px] font-semibold text-accent hover:underline"
                  >
                    All documents
                  </Link>
                  <Link
                    href={primaryVersionId ? `/editor/${primaryVersionId}` : buildLink}
                    className="inline-flex rounded-[10px] bg-accent px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-accent-dark"
                  >
                    + Create
                  </Link>
                </div>
              </div>
              {docs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D2D7DE] bg-white px-5 py-8 text-center">
                  <p className="text-[13.5px] text-muted">
                    No documents yet.{" "}
                    <Link href={buildLink} className="font-semibold text-accent hover:underline">
                      Build your first resume
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-border bg-white">
                  <div className="min-w-[640px]">
                    <div className="grid grid-cols-[1.4fr_1fr_90px_120px_120px] gap-3 border-b border-[#EEF0F3] bg-[#FAFBFC] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
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
                        className="grid grid-cols-[1.4fr_1fr_90px_120px_120px] items-center gap-3 border-b border-[#F2F3F5] px-5 py-3.5 last:border-b-0 transition-colors hover:bg-[#FAFBFC]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[#EEF3FF] text-[13px] text-accent"
                            aria-hidden
                          >
                            ▤
                          </span>
                          <span className="truncate text-[13.5px] font-semibold text-ink">
                            {doc.name}
                          </span>
                        </div>
                        <div className="truncate text-[12.5px] text-muted">
                          {doc.tailoredLabel || (
                            <span className="font-semibold text-accent">+ Add</span>
                          )}
                        </div>
                        <div className="text-[12.5px] text-[#5A6573]">Resume</div>
                        <div className="text-[12.5px] text-[#5A6573]">
                          {formatShortDate(doc.createdAt)}
                        </div>
                        <div className="text-[12.5px] text-[#8A92A0]">
                          {formatRelativeTime(doc.updatedAt)}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Interview prep entry */}
            {prepCandidates.length > 0 || applicationsCount > 0 ? (
              <section className="overflow-hidden rounded-2xl border border-border bg-white">
                <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="border-b border-[#EEF0F3] px-6 py-6 lg:border-b-0 lg:border-r">
                    <h2 className="font-display text-[20px] font-semibold tracking-[-0.02em] text-ink">
                      Two steps. Interview{" "}
                      <span className="text-[#6B7CFF]">ready.</span>
                    </h2>
                    <p className="mt-2 text-[13.5px] text-muted">
                      Get a personalized prep guide from a logged application.
                    </p>
                    <ul className="mt-4 space-y-1.5 text-[13px] text-[#3a4350]">
                      {[
                        "Concise company overview",
                        "STAR storylines",
                        "Key talking points",
                        "Practice questions",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="text-accent">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-center px-6 py-6">
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8A92A0]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF3FF] text-[12px] text-accent">
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
                            className="flex items-center justify-between gap-3 rounded-xl border border-[#E6E8EC] px-3.5 py-3 transition-colors hover:border-accent/40 hover:bg-[#F8FAFF]"
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
                      <div className="rounded-xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-4 py-5 text-[13px] text-muted">
                        Log an application first, then generate interview prep from
                        its Prepare tab.
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

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <ChecklistSection title="Get started" items={checklist} compact />
            <section className="rounded-2xl border border-[#D9E0FF] bg-gradient-to-b from-[#F5F7FF] to-white p-5">
              <h3 className="font-display text-[15px] font-semibold text-ink">
                Keep the loop tight
              </h3>
              <ul className="mt-3 space-y-2 text-[12.5px] text-[#3a4350]">
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  Tailor before you send
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  Snapshot every application
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✓</span>
                  Prep from the same job record
                </li>
              </ul>
              <Link
                href="/insights"
                className="mt-4 flex w-full items-center justify-center rounded-[11px] bg-sidebar px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1c212b]"
              >
                View insights
              </Link>
            </section>
            {versionsCount > 0 ? (
              <p className="px-1 text-center text-[12.5px] text-muted">
                {versionsCount} resume{versionsCount === 1 ? "" : "s"} ·{" "}
                {applicationsCount} application
                {applicationsCount === 1 ? "" : "s"}
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
