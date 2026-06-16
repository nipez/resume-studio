"use client";

import {
  JobCompanyField,
  JobDescField,
  JobRoleField,
  errorBoxClass,
} from "@/components/shared/job-fields";
import { Toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { logApplication } from "@/lib/applications/actions";
import { parseJobFromVersionName } from "@/lib/applications/utils";
import { clearWorkspaceJobDraft } from "@/lib/job-draft/actions";
import {
  clearJobDraftLocal,
  readJobDraft,
  readQADraft,
  writeJobDraft,
  type JobDraft,
} from "@/lib/job-draft/storage";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type LogApplicationModalProps = {
  open: boolean;
  onClose: () => void;
  versionId: string;
  resumeVersionName: string;
  initialRole?: string;
  initialCompany?: string;
  onSuccess?: (applicationId: string) => void;
};

function collectJobContext(): {
  jobRole: string;
  jobCompany: string;
  jobDesc: string;
  jobUrl: string;
  coverLetter: string;
  answers: { q: string; a: string }[];
} {
  const draft: JobDraft = readJobDraft();
  const qa = readQADraft();
  return {
    jobRole: draft.jobRole,
    jobCompany: draft.jobCompany,
    jobDesc: draft.jobDesc,
    jobUrl: draft.jobUrl,
    coverLetter: draft.coverText,
    answers: qa
      .filter((q) => q.q?.trim() && q.a?.trim())
      .map((q) => ({ q: q.q, a: q.a })),
  };
}

export function LogApplicationModal({
  open,
  onClose,
  versionId,
  resumeVersionName,
  initialRole = "",
  initialCompany = "",
  onSuccess,
}: LogApplicationModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const ctx = collectJobContext();
    const fromName = parseJobFromVersionName(resumeVersionName);
    setRole(ctx.jobRole || initialRole || fromName.role);
    setCompany(ctx.jobCompany || initialCompany || fromName.company);
    setJobDesc(ctx.jobDesc);
    setJobUrl(ctx.jobUrl);
    setError("");
  }, [open, initialRole, initialCompany, resumeVersionName]);

  function handleClose() {
    if (pending) return;
    onClose();
  }

  function handleSubmit() {
    const trimmedRole = role.trim();
    const trimmedCompany = company.trim();

    if (!trimmedRole && !trimmedCompany) {
      setError("Enter the role and company you applied to so you can find this later.");
      return;
    }

    setError("");
    writeJobDraft({
      jobRole: trimmedRole,
      jobCompany: trimmedCompany,
      jobDesc: jobDesc.trim(),
      jobUrl: jobUrl.trim(),
    });

    const ctx = collectJobContext();

    startTransition(async () => {
      try {
        const app = await logApplication({
          versionId,
          role: trimmedRole,
          company: trimmedCompany,
          jobDesc: jobDesc.trim() || ctx.jobDesc,
          jobUrl: jobUrl.trim(),
          coverLetter: ctx.coverLetter,
          answers: ctx.answers,
        });
        clearJobDraftLocal();
        await clearWorkspaceJobDraft();
        setToast("Application logged — snapshot saved");
        onClose();
        if (onSuccess) {
          onSuccess(app.id);
        } else {
          router.push(`/applications/${app.id}`);
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  if (!open) {
    return toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(13,15,20,0.55)] p-6 backdrop-blur-[3px]"
        onClick={handleClose}
      >
        <div
          className="max-h-[90vh] w-[560px] max-w-full animate-[fadeUp_0.25s_ease_both] overflow-auto rounded-[18px] bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-[21px] font-semibold tracking-[-0.02em] text-ink">
                Log application
              </h2>
              <p className="mt-[7px] max-w-[440px] text-[13.5px] leading-[1.5] text-muted">
                Save a snapshot of what you sent. Role and company are how this
                shows up in your tracker — the resume is stored separately below.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-[#F2F3F5] text-base text-[#5a6573] hover:bg-[#E6E8EC]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-[#E8ECF1] bg-[#FAFBFC] px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
              Resume snapshot
            </div>
            <div className="mt-1 text-[14px] font-semibold text-ink">
              {resumeVersionName}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <JobRoleField value={role} onChange={setRole} />
            <JobCompanyField value={company} onChange={setCompany} />
          </div>

          <JobDescField
            value={jobDesc}
            onChange={setJobDesc}
            rows={5}
            label="Job description (optional)"
          />

          <label className="mt-3 flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
            Job posting URL (optional)
            <input
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://www.indeed.com/viewjob?jk=…"
              className="rounded-[9px] border border-[#DFE3E8] px-[11px] py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </label>

          {error ? <div className={errorBoxClass}>{error}</div> : null}

          <div className="mt-5 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={pending}
              className="rounded-[11px] border border-[#DCE0E6] bg-white px-[18px] py-[11px] text-[13.5px] font-semibold text-[#3a4350] hover:bg-[#F4F5F7] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-[11px] bg-accent px-[18px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6] disabled:opacity-60"
            >
              {pending ? <Spinner /> : null}
              {pending ? "Saving snapshot…" : "Log application"}
            </button>
          </div>
        </div>
      </div>
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </>
  );
}
