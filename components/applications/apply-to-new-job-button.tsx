"use client";

import { ApplyToNewJobModal } from "@/components/applications/apply-to-new-job-modal";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { useState } from "react";

type ApplyToNewJobButtonProps = {
  versions: ResumeVersion[];
  versionCounts: Record<string, number>;
  defaultVersionId: string | null;
  isStudent?: boolean;
};

export function ApplyToNewJobButton({
  versions,
  versionCounts,
  defaultVersionId,
  isStudent = false,
}: ApplyToNewJobButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-[11px] border-none bg-accent px-[17px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] transition-colors hover:bg-accent-dark"
      >
        + {isStudent ? "Apply to new opportunity" : "Apply to new job"}
      </button>
      <ApplyToNewJobModal
        open={open}
        onClose={() => setOpen(false)}
        versions={versions}
        versionCounts={versionCounts}
        defaultVersionId={defaultVersionId}
        isStudent={isStudent}
      />
    </>
  );
}
