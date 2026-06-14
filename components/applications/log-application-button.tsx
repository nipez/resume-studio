"use client";

import { Toast } from "@/components/ui/toast";
import { logApplication } from "@/lib/applications/actions";
import {
  readJobDraft,
  readQADraft,
  type JobDraft,
} from "@/lib/job-draft/storage";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

type LogApplicationButtonProps = {
  versionId: string;
  className?: string;
  children?: ReactNode;
  onSuccess?: (applicationId: string) => void;
};

function collectJobContext(): {
  jobRole: string;
  jobCompany: string;
  jobDesc: string;
  coverLetter: string;
  answers: { q: string; a: string }[];
} {
  const draft: JobDraft = readJobDraft();
  const qa = readQADraft();
  return {
    jobRole: draft.jobRole,
    jobCompany: draft.jobCompany,
    jobDesc: draft.jobDesc,
    coverLetter: draft.coverText,
    answers: qa
      .filter((q) => q.q?.trim() && q.a?.trim())
      .map((q) => ({ q: q.q, a: q.a })),
  };
}

export function LogApplicationButton({
  versionId,
  className = "",
  children,
  onSuccess,
}: LogApplicationButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    const ctx = collectJobContext();

    startTransition(async () => {
      try {
        const app = await logApplication({
          versionId,
          role: ctx.jobRole,
          company: ctx.jobCompany,
          jobDesc: ctx.jobDesc,
          coverLetter: ctx.coverLetter,
          answers: ctx.answers,
        });
        setToast("Application logged — snapshot saved");
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

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className={
          className ||
          "inline-flex items-center gap-1.5 rounded-[11px] border-none bg-accent px-[17px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] transition-colors hover:bg-accent-dark disabled:opacity-60"
        }
      >
        {children ?? (pending ? "Logging…" : "+ Log application")}
      </button>
      {error && (
        <p className="mt-2 text-xs text-[#B23B3B]">{error}</p>
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
