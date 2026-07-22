"use client";

import { ApplyToNewJobButton } from "@/components/applications/apply-to-new-job-button";
import { LogApplicationButton } from "@/components/applications/log-application-button";
import { SaveJobButton } from "@/components/applications/save-job-button";
import { SavedJobsSection } from "@/components/applications/saved-jobs-section";
import type { Application, ApplicationStatus } from "@/lib/applications/types";
import type { ResumeVersion } from "@/lib/resume/db-types";
import type { SavedJob } from "@/lib/saved-jobs/types";
import {
  archiveApplication,
  deleteApplication,
  restoreApplication,
  updateApplicationStatus,
} from "@/lib/applications/actions";
import {
  APPLICATION_STATUSES,
  appEventLabel,
  appStatusMeta,
  applicationListHeading,
  applicationTags,
  computeApplicationStats,
  filterApplicationsBySearch,
  formatAppDate,
  formatDay,
  nextOpenEvent,
} from "@/lib/applications/utils";
import { nextActionableRecommendation } from "@/lib/applications/follow-up-recommendations";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type ApplicationsListProps = {
  applications: Application[];
  archivedApplications: Application[];
  savedJobs: SavedJob[];
  versions: ResumeVersion[];
  versionCounts: Record<string, number>;
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
  onResult,
}: {
  status: ApplicationStatus;
  applicationId: string;
  disabled?: boolean;
  onResult?: (message: string, isError: boolean) => void;
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
        const nextLabel =
          APPLICATION_STATUSES.find((o) => o.id === next)?.label ?? next;
        startTransition(async () => {
          try {
            await updateApplicationStatus(applicationId, next);
            onResult?.(`Status updated to ${nextLabel}`, false);
            router.refresh();
          } catch (err) {
            onResult?.(
              err instanceof Error ? err.message : "Failed to update status",
              true
            );
          }
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

function ApplicationsTable({
  applications,
  archived,
  pending,
  onArchive,
  onRestore,
  onDelete,
  onStatusResult,
  emptyActions,
  searchQuery = "",
}: {
  applications: Application[];
  archived: boolean;
  pending: boolean;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusResult?: (message: string, isError: boolean) => void;
  emptyActions?: React.ReactNode;
  searchQuery?: string;
}) {
  if (applications.length === 0) {
    const searching = searchQuery.trim().length > 0;
    return (
      <div className="rounded-2xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-7 py-12 text-center text-[#8A92A0]">
        <div className="mb-2.5 text-[32px] opacity-55">
          {searching ? "🔍" : archived ? "📦" : "✓"}
        </div>
        <div className="font-display text-[15px] font-semibold text-muted">
          {searching
            ? "No applications match your search"
            : archived
              ? "No archived applications"
              : "No applications tracked yet"}
        </div>
        <div className="mt-1.5 text-[13px]">
          {searching
            ? `Nothing matched “${searchQuery.trim()}” in ${archived ? "archived" : "active"} applications. Try role, company, or resume name.`
            : archived
              ? "Archive old or rejected applications to keep your active list focused — snapshots are preserved."
              : "Hit “Apply to new job” to copy a resume and tailor it, or “Log application” if you already sent one."}
        </div>
        {!archived && !searching && emptyActions ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {emptyActions}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white">
      <div className="min-w-[680px]">
      <div className="grid grid-cols-[1fr_120px_150px_minmax(140px,1fr)] gap-3.5 border-b border-[#EEF0F3] bg-[#FAFBFC] px-[22px] py-[13px] text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
        <div>Role / Company</div>
        <div>Applied</div>
        <div>Status</div>
        <div className="text-right">Actions</div>
      </div>
      {applications.map((app) => {
        const tags = applicationTags(app);
        const nextEv = nextOpenEvent(app.events ?? []);
        const suggested =
          !archived ? nextActionableRecommendation(app) : null;
        const { primary, secondary } = applicationListHeading(app);

        return (
          <div
            key={app.id}
            className={`grid grid-cols-[1fr_120px_150px_minmax(140px,1fr)] items-center gap-3.5 border-b border-[#F2F3F5] px-[22px] py-[15px] last:border-b-0 ${
              archived ? "bg-[#FAFBFC]/80" : ""
            }`}
          >
            <Link
              href={`/applications/${app.id}`}
              className="min-w-0 cursor-pointer no-underline"
            >
              <div className="truncate text-[14.5px] font-bold text-[#141821]">
                {primary}
              </div>
              {secondary ? (
                <div className="mt-0.5 truncate text-[13px] font-semibold text-[#3a4350]">
                  {secondary}
                </div>
              ) : null}
              <div className="mt-[3px] truncate text-[12.3px] text-[#8A92A0]">
                {tags.join("  ·  ")}
              </div>
              {nextEv && !archived ? (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-[#E8ECF1] bg-[#F5F7FA] px-2 py-[3px] text-[11px] font-semibold text-muted">
                  📅 {appEventLabel(nextEv.type)} · {formatDay(nextEv.date)}
                </div>
              ) : suggested ? (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-[#D9E4FF] bg-[#F0F5FF] px-2 py-[3px] text-[11px] font-semibold text-[#2456D6]">
                  ✦ Suggested: {suggested.title}
                </div>
              ) : null}
            </Link>
            <div className="text-[13px] text-[#3a4350]">
              {formatAppDate(app.applied_at)}
            </div>
            <div>
              <StatusSelect
                status={app.status}
                applicationId={app.id}
                disabled={pending}
                onResult={onStatusResult}
              />
            </div>
            <div className="flex flex-wrap justify-end gap-[7px]">
              <Link
                href={`/applications/${app.id}`}
                className="rounded-lg bg-sidebar px-3 py-[7px] text-xs font-semibold text-white transition-colors hover:bg-[#272b33]"
              >
                Open
              </Link>
              {archived ? (
                <>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onRestore(app.id)}
                    className="cursor-pointer rounded-lg border border-[#CFE0FF] bg-[#EAF1FF] px-3 py-[7px] text-xs font-semibold text-[#2456D6] transition-colors hover:border-[#A8C4FF] disabled:opacity-50"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onDelete(app.id)}
                    title="Delete permanently"
                    className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-2.5 py-[7px] text-xs text-[#B23B3B] transition-colors hover:border-[#E0A0A0] hover:bg-[#FFF6F6] disabled:opacity-50"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onArchive(app.id)}
                  className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-3 py-[7px] text-xs font-semibold text-[#5A6573] transition-colors hover:border-[#C8CED6] hover:text-ink disabled:opacity-50"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

export function ApplicationsList({
  applications,
  archivedApplications,
  savedJobs,
  versions,
  versionCounts,
  defaultVersionId,
  defaultVersionName,
  defaultVersionRole = "",
  defaultVersionCompany = "",
  isStudent = false,
}: ApplicationsListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [confirmAction, setConfirmAction] = useState<
    { kind: "archive" | "delete"; id: string } | null
  >(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const stats = computeApplicationStats(applications);
  const tabApplications =
    tab === "active" ? applications : archivedApplications;
  const visibleApplications = useMemo(
    () => filterApplicationsBySearch(tabApplications, searchQuery),
    [tabApplications, searchQuery]
  );
  const isSearching = searchQuery.trim().length > 0;

  function handleStatusResult(message: string, isError: boolean) {
    setToast(isError ? `⚠ ${message}` : message);
  }

  function handleConfirm() {
    const action = confirmAction;
    if (!action) return;
    startTransition(async () => {
      try {
        if (action.kind === "archive") {
          await archiveApplication(action.id);
          setToast("Application archived — snapshot preserved");
        } else {
          await deleteApplication(action.id);
          setToast("Application deleted");
        }
        setConfirmAction(null);
        router.refresh();
      } catch (err) {
        setConfirmAction(null);
        setToast(
          `⚠ ${err instanceof Error ? err.message : "Something went wrong"}`
        );
      }
    });
  }

  function handleRestore(id: string) {
    startTransition(async () => {
      await restoreApplication(id);
      setTab("active");
      setToast("Application restored to your active list");
      router.refresh();
    });
  }

  const secondaryBtnClass =
    "inline-flex items-center gap-1.5 rounded-[10px] border border-[#E4E7EC] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#5A6573] transition-colors hover:border-[#C8CED6] hover:bg-[#FAFBFC] hover:text-ink";

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1080px] px-5 pb-16 pt-5 sm:px-8 lg:px-12">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-[560px]">
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
              Applications
            </h1>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
              {isStudent
                ? "Apply to a role with a tailored resume, then track each one with the materials you sent."
                : "Apply to a job with a tailored resume, then track each application with the materials you sent."}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {versions.length > 0 ? (
              <ApplyToNewJobButton
                versions={versions}
                versionCounts={versionCounts}
                defaultVersionId={defaultVersionId}
                isStudent={isStudent}
                className="inline-flex items-center justify-center gap-1.5 rounded-[12px] border-none bg-accent px-5 py-3 text-[14.5px] font-semibold text-white shadow-[0_4px_16px_rgba(47,107,255,0.34)] transition-colors hover:bg-accent-dark"
              />
            ) : (
              <Link
                href="/library"
                className="inline-flex items-center justify-center gap-1.5 rounded-[12px] border-none bg-accent px-5 py-3 text-[14.5px] font-semibold text-white shadow-[0_4px_16px_rgba(47,107,255,0.34)] transition-colors hover:bg-accent-dark"
              >
                + Create a resume first
              </Link>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <SaveJobButton className={secondaryBtnClass} />
              {defaultVersionId ? (
                <LogApplicationButton
                  versionId={defaultVersionId}
                  resumeVersionName={defaultVersionName ?? "Resume"}
                  initialRole={defaultVersionRole}
                  initialCompany={defaultVersionCompany}
                  isStudent={isStudent}
                  className={secondaryBtnClass}
                />
              ) : null}
            </div>
          </div>
        </div>

        <SavedJobsSection
          savedJobs={savedJobs}
          defaultVersionId={defaultVersionId}
          defaultVersionName={defaultVersionName ?? null}
          isStudent={isStudent}
        />

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-[17px] font-semibold text-ink">
            Logged applications
          </h2>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("active")}
              className={`cursor-pointer rounded-[10px] border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                tab === "active"
                  ? "border-accent/30 bg-white text-accent shadow-[0_2px_10px_rgba(36,86,214,0.08)]"
                  : "border-transparent bg-[#ECEEF1]/70 text-[#5A6573] hover:border-[#E2E5EA] hover:bg-white"
              }`}
            >
              Active
              {applications.length > 0 ? (
                <span className="ml-1.5 text-[12px] font-bold opacity-80">
                  {applications.length}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setTab("archived")}
              className={`cursor-pointer rounded-[10px] border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                tab === "archived"
                  ? "border-accent/30 bg-white text-accent shadow-[0_2px_10px_rgba(36,86,214,0.08)]"
                  : "border-transparent bg-[#ECEEF1]/70 text-[#5A6573] hover:border-[#E2E5EA] hover:bg-white"
              }`}
            >
              Archived
              {archivedApplications.length > 0 ? (
                <span className="ml-1.5 text-[12px] font-bold opacity-80">
                  {archivedApplications.length}
                </span>
              ) : null}
            </button>
          </div>
          {(tabApplications.length > 0 || isSearching) ? (
            <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search role, company, resume…"
                aria-label="Search applications"
                className="w-full rounded-[10px] border border-[#DFE3E8] bg-white py-2 pl-9 pr-8 text-[13px] text-ink placeholder:text-[#9AA3AF] focus:border-accent focus:outline-none"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA3AF]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              {isSearching ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md px-1.5 py-0.5 text-[12px] font-semibold text-[#8A92A0] hover:bg-[#F2F3F5] hover:text-ink"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {isSearching ? (
          <p className="mb-4 text-[12.5px] text-muted">
            {visibleApplications.length === 0
              ? `No matches in ${tab === "archived" ? "archived" : "active"} applications`
              : `${visibleApplications.length} of ${tabApplications.length} ${tab === "archived" ? "archived" : "active"} application${visibleApplications.length === 1 ? "" : "s"}`}
          </p>
        ) : null}

        {tab === "active" && !isSearching ? (
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
        ) : null}

        <ApplicationsTable
          applications={visibleApplications}
          archived={tab === "archived"}
          pending={pending}
          searchQuery={searchQuery}
          onArchive={(id) => setConfirmAction({ kind: "archive", id })}
          onRestore={handleRestore}
          onDelete={(id) => setConfirmAction({ kind: "delete", id })}
          onStatusResult={handleStatusResult}
          emptyActions={
            <>
              {versions.length > 0 ? (
                <ApplyToNewJobButton
                  versions={versions}
                  versionCounts={versionCounts}
                  defaultVersionId={defaultVersionId}
                  isStudent={isStudent}
                />
              ) : (
                <Link
                  href="/build"
                  className="inline-flex items-center gap-1.5 rounded-[11px] bg-accent px-[17px] py-[11px] text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1E54E6]"
                >
                  Build your resume first
                </Link>
              )}
              {defaultVersionId ? (
                <LogApplicationButton
                  versionId={defaultVersionId}
                  resumeVersionName={defaultVersionName ?? "Resume"}
                  initialRole={defaultVersionRole}
                  initialCompany={defaultVersionCompany}
                  isStudent={isStudent}
                  className="inline-flex items-center gap-1.5 rounded-[11px] border border-[#D6E4FF] bg-white px-[17px] py-[11px] text-[13.5px] font-semibold text-[#2456D6] transition-colors hover:border-accent hover:bg-[#F5F8FF]"
                />
              ) : null}
            </>
          }
        />
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction?.kind === "delete"
            ? "Delete permanently?"
            : "Archive this application?"
        }
        description={
          confirmAction?.kind === "delete"
            ? "This archived application and its snapshot will be permanently deleted. This cannot be undone."
            : "It moves out of your active list and insights — the snapshot is preserved and you can restore it anytime."
        }
        confirmLabel={confirmAction?.kind === "delete" ? "Delete" : "Archive"}
        danger={confirmAction?.kind === "delete"}
        pending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
