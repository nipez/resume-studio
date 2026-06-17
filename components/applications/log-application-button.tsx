"use client";

import { LogApplicationModal } from "@/components/applications/log-application-modal";
import { activateSavedJobForPrep } from "@/lib/saved-jobs/actions";
import { writeJobDraft } from "@/lib/job-draft/storage";
import { useState, type ReactNode } from "react";

type LogApplicationButtonProps = {
  versionId: string;
  resumeVersionName: string;
  initialRole?: string;
  initialCompany?: string;
  savedJobId?: string;
  className?: string;
  children?: ReactNode;
  onSuccess?: (applicationId: string) => void;
};

export function LogApplicationButton({
  versionId,
  resumeVersionName,
  initialRole,
  initialCompany,
  savedJobId,
  className = "",
  children,
  onSuccess,
}: LogApplicationButtonProps) {
  const [open, setOpen] = useState(false);
  const [priming, setPriming] = useState(false);

  async function handleOpen() {
    if (savedJobId) {
      setPriming(true);
      try {
        const draft = await activateSavedJobForPrep(savedJobId);
        if (draft) writeJobDraft(draft);
      } finally {
        setPriming(false);
      }
    }
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleOpen()}
        disabled={priming}
        className={
          className ||
          "inline-flex items-center gap-1.5 rounded-[11px] border-none bg-accent px-[17px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] transition-colors hover:bg-accent-dark"
        }
      >
        {priming ? "Loading…" : (children ?? "+ Log application")}
      </button>
      <LogApplicationModal
        open={open}
        onClose={() => setOpen(false)}
        versionId={versionId}
        resumeVersionName={resumeVersionName}
        initialRole={initialRole}
        initialCompany={initialCompany}
        onSuccess={onSuccess}
      />
    </>
  );
}
