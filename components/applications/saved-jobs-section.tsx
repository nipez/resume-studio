"use client";

import { LogApplicationButton } from "@/components/applications/log-application-button";
import { SaveJobModal } from "@/components/applications/save-job-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Toast } from "@/components/ui/toast";
import { activateSavedJobForPrep, deleteSavedJob } from "@/lib/saved-jobs/actions";
import type { SavedJob } from "@/lib/saved-jobs/types";
import { writeJobDraft } from "@/lib/job-draft/storage";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SavedJobsSectionProps = {
  savedJobs: SavedJob[];
  defaultVersionId: string | null;
  defaultVersionName: string | null;
  isStudent?: boolean;
};

function jobTitle(job: SavedJob) {
  const role = job.role.trim() || "Role";
  const company = job.company.trim();
  return company ? `${role} · ${company}` : role;
}

function formatSavedDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function SavedJobsSection({
  savedJobs,
  defaultVersionId,
  defaultVersionName,
  isStudent = false,
}: SavedJobsSectionProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingJob, setEditingJob] = useState<SavedJob | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [removeJobId, setRemoveJobId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function startPrep(jobId: string, href: string) {
    setBusyAction(`${jobId}:${href}`);
    startTransition(async () => {
      const draft = await activateSavedJobForPrep(jobId);
      if (draft) writeJobDraft(draft);
      router.push(href);
    });
  }

  function handleRemoveConfirmed() {
    if (!removeJobId) return;
    startTransition(async () => {
      try {
        await deleteSavedJob(removeJobId);
        setRemoveJobId(null);
        setToast("Job removed from your queue");
        router.refresh();
      } catch (err) {
        setRemoveJobId(null);
        setToast(
          `⚠ ${err instanceof Error ? err.message : "Failed to remove job"}`
        );
      }
    });
  }

  if (savedJobs.length === 0) {
    return (
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-[17px] font-semibold text-ink">
              My saved jobs
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              Queue roles before you apply — tailor, cover letter, then log.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-display text-[15px] font-semibold text-ink">
              Add your first job
            </div>
            <p className="mt-1 text-[13px] text-muted">
              Save a posting here so it&apos;s ready when you want to tailor.
            </p>
          </div>
          <span className="text-[12.5px] font-semibold text-accent">
            Use “Save job” above →
          </span>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mb-8">
      <div className="mb-3">
        <h2 className="font-display text-[17px] font-semibold text-ink">
          My saved jobs
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          Roles you&apos;re preparing for — not logged until you apply.
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
        {savedJobs.map((job) => {
          const versionId = job.tailored_version_id ?? defaultVersionId;
          const versionName = job.tailored_version_id
            ? jobTitle(job)
            : defaultVersionName ?? "Resume";
          const hasResume = Boolean(job.tailored_version_id);
          const hasCover = Boolean(job.cover_text.trim());
          const versionQuery = job.tailored_version_id
            ? `&v=${job.tailored_version_id}`
            : defaultVersionId
            ? `&v=${defaultVersionId}`
            : "";

          return (
            <div
              key={job.id}
              className="flex flex-col rounded-2xl border border-[#E6E8EC] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-display text-[15px] font-semibold leading-snug text-ink">
                  {jobTitle(job)}
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setEditingJob(job)}
                  className="cursor-pointer flex-none border-none bg-transparent p-0 text-[12px] font-semibold text-[#2456D6] hover:underline disabled:opacity-50"
                >
                  Edit
                </button>
              </div>
              <div className="mt-1 text-[12px] text-[#8A92A0]">
                Saved {formatSavedDate(job.updated_at)}
                {job.job_url.trim() ? (
                  <>
                    {" · "}
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#2456D6] hover:underline"
                    >
                      Posting
                    </a>
                  </>
                ) : null}
              </div>
              {job.notes.trim() ? (
                <p className="mt-2 text-[12.5px] leading-[1.45] text-[#5A6573]">
                  {job.notes}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    hasResume
                      ? "bg-[#EAF7F0] text-[#0E7C4B]"
                      : "bg-[#F2F3F5] text-[#8A92A0]"
                  }`}
                >
                  {hasResume ? "Resume ✓" : "Resume"}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    hasCover
                      ? "bg-[#EAF7F0] text-[#0E7C4B]"
                      : "bg-[#F2F3F5] text-[#8A92A0]"
                  }`}
                >
                  {hasCover ? "Cover ✓" : "Cover"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(
                  [
                    {
                      label: "Tailor resume",
                      href: `/tailor?job=${job.id}${versionQuery}`,
                      cls: "border-[#D6E4FF] bg-[#F5F8FF] text-[#2456D6] hover:bg-[#EAF1FF]",
                    },
                    {
                      label: "Cover letter",
                      href: `/cover?job=${job.id}${versionQuery}`,
                      cls: "border-[#E2E5EA] bg-[#FAFBFC] text-[#3a4350] hover:bg-[#F2F3F5]",
                    },
                    {
                      label: "Q&A",
                      href: `/questions?job=${job.id}`,
                      cls: "border-[#E2E5EA] bg-[#FAFBFC] text-[#3a4350] hover:bg-[#F2F3F5]",
                    },
                  ] as const
                ).map((action) => {
                  const isBusy =
                    pending && busyAction === `${job.id}:${action.href}`;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      disabled={pending}
                      onClick={() => startPrep(job.id, action.href)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] border px-3 py-2 text-[12.5px] font-semibold disabled:opacity-50 ${action.cls}`}
                    >
                      {isBusy ? <Spinner className="h-3 w-3" /> : null}
                      {isBusy ? "Opening…" : action.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#F0F1F4] pt-3">
                {versionId ? (
                  <LogApplicationButton
                    versionId={versionId}
                    resumeVersionName={versionName}
                    initialRole={job.role}
                    initialCompany={job.company}
                    isStudent={isStudent}
                    className="rounded-[9px] border-none bg-accent px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-[#1E54E6]"
                    onSuccess={() => {
                      void deleteSavedJob(job.id).then(() => router.refresh());
                    }}
                    savedJobId={job.id}
                  >
                    Log application
                  </LogApplicationButton>
                ) : (
                  <span className="text-[12px] text-muted">
                    Tailor a resume to log this application
                  </span>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setRemoveJobId(job.id)}
                  className="ml-auto cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[#B23B3B] hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </section>

      <SaveJobModal
        open={editingJob !== null}
        job={editingJob}
        onClose={() => setEditingJob(null)}
      />
      <ConfirmDialog
        open={removeJobId !== null}
        title="Remove this saved job?"
        description="It comes off your queue — any tailored resume or cover letter stays in your library."
        confirmLabel="Remove"
        danger
        pending={pending}
        onConfirm={handleRemoveConfirmed}
        onCancel={() => setRemoveJobId(null)}
      />
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </>
  );
}
