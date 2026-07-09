"use client";

import { Spinner } from "@/components/ui/spinner";
import { clearWorkspaceJobDraft } from "@/lib/job-draft/actions";
import { clearJobDraftLocal } from "@/lib/job-draft/storage";
import { createResumeVersion } from "@/lib/resume/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { versionCardMeta } from "@/lib/resume/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

type ApplyToNewJobModalProps = {
  open: boolean;
  onClose: () => void;
  versions: ResumeVersion[];
  versionCounts: Record<string, number>;
  defaultVersionId: string | null;
  isStudent?: boolean;
};

export function ApplyToNewJobModal({
  open,
  onClose,
  versions,
  versionCounts,
  defaultVersionId,
  isStudent = false,
}: ApplyToNewJobModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState("");

  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => {
      const aApps = versionCounts[a.id] ?? 0;
      const bApps = versionCounts[b.id] ?? 0;
      if (bApps !== aApps) return bApps - aApps;
      return b.updated_at.localeCompare(a.updated_at);
    });
  }, [versions, versionCounts]);

  useEffect(() => {
    if (!open) return;
    const preferred =
      (defaultVersionId && versions.some((v) => v.id === defaultVersionId)
        ? defaultVersionId
        : null) ?? sortedVersions[0]?.id ?? "";
    setSelectedId(preferred);
    setError("");
  }, [open, defaultVersionId, versions, sortedVersions]);

  function handleClose() {
    if (pending) return;
    onClose();
  }

  function handleContinue() {
    if (!selectedId) {
      setError("Pick a resume to copy from.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const copy = await createResumeVersion(selectedId);
        clearJobDraftLocal();
        await clearWorkspaceJobDraft();
        onClose();
        router.push(`/tailor?v=${copy.id}&new=1`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(13,15,20,0.55)] p-6 backdrop-blur-[3px]"
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-[620px] max-w-full animate-[fadeUp_0.25s_ease_both] overflow-auto rounded-[18px] bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[21px] font-semibold tracking-[-0.02em] text-ink">
              {isStudent ? "Apply to a new opportunity" : "Apply to a new job"}
            </h2>
            <p className="mt-[7px] max-w-[480px] text-[13.5px] leading-[1.5] text-muted">
              {isStudent
                ? "Start from a resume you've already built. We'll copy it so your original stays untouched — then tailor it for the new role."
                : "Start from a resume you've already used. We'll copy it so your original stays untouched — then tailor it for the new posting."}
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

        {versions.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-5 py-8 text-center">
            <p className="text-[14px] font-semibold text-ink">No resumes yet</p>
            <p className="mt-1.5 text-[13px] text-muted">
              Build one first, then come back to apply to new jobs from here.
            </p>
            <Link
              href="/library"
              className="mt-4 inline-flex rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1E54E6]"
            >
              Go to Resume Library →
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {sortedVersions.map((version) => {
              const meta = versionCardMeta(version);
              const appCount = versionCounts[version.id] ?? 0;
              const selected = selectedId === version.id;

              return (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => setSelectedId(version.id)}
                  className={`w-full cursor-pointer rounded-xl border px-4 py-3.5 text-left transition-colors ${
                    selected
                      ? "border-accent bg-[#F5F8FF] shadow-[0_0_0_1px_rgba(47,107,255,0.2)]"
                      : "border-[#E8ECF1] bg-[#FAFBFC] hover:border-[#D2D7DE] hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 ${
                        selected
                          ? "border-accent bg-accent text-[11px] font-bold text-white"
                          : "border-[#CBD2DB] bg-white"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[14px] font-bold text-ink">
                          {version.name}
                        </span>
                        {version.id === defaultVersionId ? (
                          <span className="rounded-md bg-[#EEF3FF] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em] text-[#1E54E6]">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 truncate text-[12.5px] text-[#8A92A0]">
                        {meta.headline}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-[#8A92A0]">
                        <span>{meta.badge}</span>
                        <span>{meta.updated}</span>
                        {appCount > 0 ? (
                          <span className="font-semibold text-[#2456D6]">
                            Used in {appCount} application{appCount === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </div>
                      {meta.tailored ? (
                        <div className="mt-1 truncate text-[11.5px] font-semibold text-[#2456D6]">
                          {meta.tailored}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {error ? (
          <div className="mt-4 rounded-[10px] border border-[#F2D2D2] bg-[#FCECEC] px-3.5 py-2.5 text-[13px] text-[#B23B3B]">
            {error}
          </div>
        ) : null}

        {versions.length > 0 ? (
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
              onClick={handleContinue}
              disabled={pending || !selectedId}
              className="inline-flex items-center gap-2 rounded-[11px] bg-accent px-[18px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6] disabled:opacity-60"
            >
              {pending ? <Spinner /> : null}
              {pending ? "Copying resume…" : "Copy & tailor for new job →"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
