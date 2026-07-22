"use client";

import { ApplyToNewJobModal } from "@/components/applications/apply-to-new-job-modal";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { useState } from "react";

type ApplyToNewJobButtonProps = {
  versions: ResumeVersion[];
  versionCounts: Record<string, number>;
  defaultVersionId: string | null;
  isStudent?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function ApplyToNewJobButton({
  versions,
  versionCounts,
  defaultVersionId,
  isStudent = false,
  className = "",
  children,
}: ApplyToNewJobButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-1.5 rounded-[11px] border-none bg-accent px-[17px] py-[11px] text-[13.5px] font-semibold text-white shadow-accent transition-colors hover:bg-accent-dark"
        }
      >
        {children ??
          `+ ${isStudent ? "Apply to new opportunity" : "Apply to new job"}`}
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
