"use client";

import { createResumeVersion } from "@/lib/resume/actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LibraryToolbar({
  createLabel = "+ New version",
}: {
  createLabel?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleNewVersion() {
    startTransition(async () => {
      const version = await createResumeVersion();
      router.push(`/editor/${version.id}`);
    });
  }

  return (
    <div className="flex gap-2.5">
      <button
        type="button"
        disabled={pending}
        onClick={handleNewVersion}
        className="inline-flex items-center gap-1.5 rounded-[11px] bg-accent px-[17px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] transition-colors hover:bg-[#1E54E6] disabled:opacity-60"
      >
        {createLabel}
      </button>
    </div>
  );
}
