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
    <button
      type="button"
      disabled={pending}
      onClick={handleNewVersion}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-accent transition-colors hover:bg-accent-dark disabled:opacity-60"
    >
      {createLabel}
    </button>
  );
}
