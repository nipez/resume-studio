"use client";

import { LogApplicationButton } from "@/components/applications/log-application-button";
import { SaveJobButton } from "@/components/applications/save-job-button";
import { SavedJobsSection } from "@/components/applications/saved-jobs-section";
import type { Application, ApplicationStatus } from "@/lib/applications/types";
import type { SavedJob } from "@/lib/saved-jobs/types";
import {
  deleteApplication,
  updateApplicationStatus,
} from "@/lib/applications/actions";
import {
  APPLICATION_STATUSES,
  appEventLabel,
  appStatusMeta,
  applicationListHeading,
  applicationTags,
  computeApplicationStats,
  formatAppDate,
  formatDay,
  nextOpenEvent,
} from "@/lib/applications/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type ApplicationsListProps = {
  applications: Application[];
  savedJobs: SavedJob[];
  defaultVersionId: string | null;
  defaultVersionName?: string | null;
  defaultVersionRole?: string;
  defaultVersionCompany?: string;
  isStudent?: boolean;
};

function StatCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: ReturnType<typeof appStatusMeta> | null;
}) {
  if (meta) {
    return (
      <div
        className="min-w-[120px] flex-1 rounded-[14px] border px-[18px] py-4"
        style={{
          background: meta.bg,
          color: meta.fg,
          borderColor: meta.bd,
        }}
      >
        <div className="font-display text-[25px] font-semibold leading-none">
          {value}
        </div>
        <div className="mt-1.5 text-xs font-semibold opacity-85">{label}</div>
      </div>
    );
  }

  return (
    <div className="min-w-[120px] flex-1 rounded-[14px] bg-sidebar px-[18px] py-4 text-white">
      <div className="font-display text-[25px] font-semibold leading-none">
        {value}
      </div>
      <div className="mt-1.5 text-xs font-semibold opacity-85">{label}</div>
    </div>
  );
}

function StatusSelect({
  status,
  applicationId,
  disabled,
}: {
  status: ApplicationStatus;
  applicationId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const meta = appStatusMeta(status);

  return (
    <select
      value={status}
      disabled={disabled || pending}
      onChange={(e) => {
        const next = e.target.value as ApplicationStatus;
        startTransition(async () => {
          await updateApplicationStatus(applicationId, next);
          router.refresh();
        });
      }}
      className="cursor-pointer rounded-lg border px-[11px] py-[7px] text-[12.5px] font-bold disabled:opacity-60"
      style={{
        borderColor: meta.bd,
        background: meta.bg,
        color: meta.fg,
      }}
    >
      {APPLICATION_STATUSES.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ApplicationsList({
  applications,
  savedJobs,
  defaultVersionId,
  defaultVersionName,
  defaultVersionRole = "",
  defaultVersionCompany = "",
  isStudent = false,
}: ApplicationsListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const stats = computeApplicationStats(applications);

  function handleDelete(id: string) {
    if (!confirm("Delete this application and its snapshot? This cannot be undone."))
      return;
    startTransition(async () => {
      await deleteApplication(id);
      router.refresh();
    });
  }

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1080px] px-12 pb-16 pt-[42px]">
        <div className="mb-[26px] flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
              Applications
            </h1>
            <p className="mt-2 max-w-[600px] text-[14.5px] leading-relaxed text-muted">
              {isStudent
                ? "Save jobs and internships you want to apply to, then track each one with a snapshot of the resume, cover letter, and answers you sent."
                : "Save jobs you want to apply to, then track each application with a snapshot of the resume, cover letter, and answers you sent."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SaveJobButton />
            {defaultVersionId ? (
              <LogApplicationButton
                versionId={defaultVersionId}
                resumeVersionName={defaultVersionName ?? "Resume"}
                initialRole={defaultVersionRole}
                initialCompany={defaultVersionCompany}
                isStudent={isStudent}
              />
            ) : (
              <Link
                href="/library"
                className="inline-flex items-center gap-1.5 rounded-[11px] bg-accent px-[17px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] transition-colors hover:bg-accent-dark"
              >
                + Create a resume first
              </Link>
            )}
          </div>
        </div>

        <SavedJobsSection
          savedJobs={savedJobs}
          defaultVersionId={defaultVersionId}
          defaultVersionName={defaultVersionName ?? null}
          isStudent={isStudent}
        />

        <div className="mb-3">
          <h2 className="font-display text-[17px] font-semibold text-ink">
            Logged applications
          </h2>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <StatCard label="Total" value={String(stats.total)} />
          <StatCard
            label="Responses"
            value={String(stats.respondedCount)}
            meta={appStatusMeta("response")}
          />
          <StatCard
            label="Interviews"
            value={String(stats.interviewCount)}
            meta={appStatusMeta("interview")}
          />
          <StatCard
            label="Offers"
            value={String(stats.offerCount)}
            meta={appStatusMeta("offer")}
          />
          <StatCard
            label="Response rate"
            value={`${stats.respRate}%`}
            meta={appStatusMeta("applied")}
          />
        </div>

        {applications.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <div className="grid grid-cols-[1fr_120px_150px_96px] gap-3.5 border-b border-[#EEF0F3] bg-[#FAFBFC] px-[22px] py-[13px] text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
              <div>Role / Company</div>
              <div>Applied</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>
            {applications.map((app) => {
              const tags = applicationTags(app);
              const nextEv = nextOpenEvent(app.events ?? []);
              const { primary, secondary } = applicationListHeading(app);

              return (
                <div
                  key={app.id}
                  className="grid grid-cols-[1fr_120px_150px_96px] items-center gap-3.5 border-b border-[#F2F3F5] px-[22px] py-[15px] last:border-b-0"
                >
                  <Link
                    href={`/applications/${app.id}`}
                    className="min-w-0 cursor-pointer no-underline"
                  >
                    <div className="truncate text-[14.5px] font-bold text-[#141821]">
                      {primary}
                      {secondary && (
                        <span className="font-semibold text-[#8A92A0]">
                          {" "}
                          · {secondary}
                        </span>
                      )}
                    </div>
                    <div className="mt-[3px] truncate text-[12.3px] text-[#8A92A0]">
                      {tags.join("  ·  ")}
                    </div>
                    {nextEv && (
                      <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-[#E8ECF1] bg-[#F5F7FA] px-2 py-[3px] text-[11px] font-semibold text-muted">
                        📅 {appEventLabel(nextEv.type)} ·{" "}
                        {formatDay(nextEv.date)}
                      </div>
                    )}
                  </Link>
                  <div className="text-[13px] text-[#3a4350]">
                    {formatAppDate(app.applied_at)}
                  </div>
                  <div>
                    <StatusSelect
                      status={app.status}
                      applicationId={app.id}
                      disabled={pending}
                    />
                  </div>
                  <div className="flex justify-end gap-[7px]">
                    <Link
                      href={`/applications/${app.id}`}
                      className="rounded-lg bg-sidebar px-3 py-[7px] text-xs font-semibold text-white transition-colors hover:bg-[#272b33]"
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDelete(app.id)}
                      title="Delete application"
                      className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-2.5 py-[7px] text-xs text-[#B23B3B] transition-colors hover:border-[#E0A0A0] hover:bg-[#FFF6F6] disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-7 py-12 text-center text-[#8A92A0]">
            <div className="mb-2.5 text-[32px] opacity-55">✓</div>
            <div className="font-display text-[15px] font-semibold text-muted">
              No applications tracked yet
            </div>
            <div className="mt-1.5 text-[13px]">
              Hit &ldquo;Log application&rdquo; and enter the role and company —
              we&apos;ll snapshot the resume, cover letter, and Q&amp;A you used.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
