"use client";

import {
  JobCompanyField,
  JobDescField,
  JobRoleField,
  errorBoxClass,
} from "@/components/shared/job-fields";
import { JobDescParseButton } from "@/components/shared/job-desc-parse-button";
import { JobUrlImport } from "@/components/shared/job-url-import";
import { ResumeContextNotesField } from "@/components/shared/resume-context-notes-field";
import { Spinner } from "@/components/ui/spinner";
import { Toast } from "@/components/ui/toast";
import { useEscapeKey } from "@/components/ui/confirm-dialog";
import { createSavedJob, updateSavedJob } from "@/lib/saved-jobs/actions";
import type { SavedJob } from "@/lib/saved-jobs/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type SaveJobModalProps = {
  open: boolean;
  onClose: () => void;
  /** When set, modal edits an existing saved job instead of creating one. */
  job?: SavedJob | null;
};

const emptyForm = {
  role: "",
  company: "",
  jobDesc: "",
  jobUrl: "",
  contextNotes: "",
  notes: "",
};

export function SaveJobModal({ open, onClose, job = null }: SaveJobModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const isEdit = Boolean(job);

  useEscapeKey(open && !pending, onClose);

  useEffect(() => {
    if (!open) return;
    setError("");
    if (job) {
      setRole(job.role);
      setCompany(job.company);
      setJobDesc(job.job_desc);
      setJobUrl(job.job_url);
      setContextNotes(job.context_notes);
      setNotes(job.notes);
    } else {
      setRole(emptyForm.role);
      setCompany(emptyForm.company);
      setJobDesc(emptyForm.jobDesc);
      setJobUrl(emptyForm.jobUrl);
      setContextNotes(emptyForm.contextNotes);
      setNotes(emptyForm.notes);
    }
  }, [open, job]);

  if (!open) {
    return toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null;
  }

  function handleClose() {
    if (pending) return;
    onClose();
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      try {
        if (job) {
          await updateSavedJob(job.id, {
            role,
            company,
            jobDesc,
            jobUrl,
            contextNotes,
            notes,
          });
        } else {
          await createSavedJob({
            role,
            company,
            jobDesc,
            jobUrl,
            contextNotes,
            notes,
          });
        }
        setToast(job ? "Saved job updated" : "Job saved to your queue");
        onClose();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-job-modal-title"
        className="max-h-[90vh] w-full max-w-[520px] overflow-auto rounded-2xl border border-[#E6E8EC] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="save-job-modal-title"
            className="font-display text-[20px] font-semibold text-ink"
          >
            {isEdit ? "Edit saved job" : "Save job to apply to"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-[32px] w-[32px] flex-none cursor-pointer items-center justify-center rounded-[9px] bg-[#F2F3F5] text-[15px] text-[#5a6573] hover:bg-[#E6E8EC]"
          >
            ✕
          </button>
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          {isEdit
            ? "Update the posting link, description, or notes — your tailor progress is kept."
            : "Add a role you want to pursue later. Tailor a resume and cover letter from your queue when you're ready."}
        </p>

        <div className="mt-4">
          {!isEdit ? (
            <JobUrlImport
              urlOnly
              onImported={(fields) => {
                setRole(fields.jobRole);
                setCompany(fields.jobCompany);
                setJobDesc(fields.jobDesc);
                setJobUrl(fields.jobUrl ?? jobUrl);
              }}
              successMessage="Imported — review the fields below."
            />
          ) : null}
          <div className={`grid grid-cols-2 gap-3 ${isEdit ? "" : "mt-3"}`}>
            <JobRoleField value={role} onChange={setRole} />
            <JobCompanyField value={company} onChange={setCompany} />
          </div>
          <JobDescField value={jobDesc} onChange={setJobDesc} rows={6} />
          <JobDescParseButton
            text={jobDesc}
            onParsed={(fields) => {
              setRole(fields.jobRole || role);
              setCompany(fields.jobCompany || company);
              setJobDesc(fields.jobDesc);
              setJobUrl(fields.jobUrl ?? jobUrl);
            }}
            className="mt-2"
          />
          <label className="mt-3 flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
            Job posting URL (optional)
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://company.com/careers/role — saved for later"
              className="rounded-[9px] border border-[#DFE3E8] px-[11px] py-2.5 text-sm font-normal text-ink focus:border-accent focus:outline-none"
            />
            <span className="text-[11.5px] font-normal leading-snug text-[#8A92A0]">
              Link to the live posting — especially if you pasted the description from
              Indeed or LinkedIn. Shows as &ldquo;Posting&rdquo; on your saved job
              card.
            </span>
          </label>
          <ResumeContextNotesField
            className="mt-4"
            value={contextNotes}
            onChange={setContextNotes}
            label="Extra context (optional)"
            hint="Referral, why this company, stories to emphasize — used when you tailor."
          />
          <label className="mt-4 flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
            Your notes (optional)
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Found via LinkedIn, apply before Friday"
              className="rounded-[9px] border border-[#DFE3E8] px-[11px] py-2.5 text-sm font-normal focus:border-accent focus:outline-none"
            />
          </label>
        </div>

        {error ? <div className={`${errorBoxClass} mt-3`}>{error}</div> : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={handleClose}
            className="cursor-pointer rounded-[9px] border border-[#E2E5EA] bg-white px-4 py-2 text-[13px] font-semibold text-[#3a4350] hover:bg-[#F4F5F7] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={handleSubmit}
            className="inline-flex cursor-pointer items-center gap-2 rounded-[9px] border-none bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-50"
          >
            {pending ? <Spinner /> : null}
            {pending ? "Saving…" : isEdit ? "Save changes" : "Save job"}
          </button>
        </div>
      </div>
    </div>
  );
}
