"use client";

import { SaveJobModal } from "@/components/applications/save-job-modal";
import { useState } from "react";

type SaveJobButtonProps = {
  className?: string;
};

export function SaveJobButton({ className = "" }: SaveJobButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-1.5 rounded-[11px] border border-[#D6E4FF] bg-[#F5F8FF] px-[17px] py-[11px] text-[13.5px] font-semibold text-[#2456D6] transition-colors hover:border-accent hover:bg-[#EAF1FF]"
        }
      >
        + Save job to apply to
      </button>
      <SaveJobModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
