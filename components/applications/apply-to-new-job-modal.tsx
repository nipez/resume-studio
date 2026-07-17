"use client";

import { Spinner } from "@/components/ui/spinner";
import { useEscapeKey } from "@/components/ui/confirm-dialog";
import { clearWorkspaceJobDraft } from "@/lib/job-draft/actions";
import { clearJobDraftLocal } from "@/lib/job-draft/storage";
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

const SEARCH_THRESHOLD = 5;

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
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEscapeKey(open && !pending, onClose);

  /** Default resume first, then most recently updated. */
  const sortedVersions = useMemo(() => {
    return [...versions].sort((a, b) => {
      if (defaultVersionId) {
        if (a.id === defaultVersionId) return -1;
        if (b.id === defaultVersionId) return 1;
      }
      return b.updated_at.localeCompare(a.updated_at);
    });
  }, [versions, defaultVersionId]);

  const filteredVersions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sortedVersions;
    return sortedVersions.filter((version) => {
      const meta = versionCardMeta(version);
      const appCount = versionCounts[version.id] ?? 0;
      const haystack = [
        version.name,
        meta.headline,
        meta.badge,
        meta.tailored,
        appCount > 0 ? `${appCount} applications` : "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [sortedVersions, query, versionCounts]);

  useEffect(() => {
    if (!open) return;
    const preferred =
      (defaultVersionId && versions.some((v) => v.id === defaultVersionId)
        ? defaultVersionId
        : null) ??
      sortedVersions[0]?.id ??
      "";
    setSelectedId(preferred);
    setQuery("");
    setError("");
  }, [open, defaultVersionId, versions, sortedVersions]);

  // Keep selection valid if search hides the current row.
  useEffect(() => {
    if (!open || !selectedId) return;
    if (filteredVersions.some((v) => v.id === selectedId)) return;
    setSelectedId(filteredVersions[0]?.id ?? "");
  }, [open, selectedId, filteredVersions]);

  function handleClose() {
    if (pending) return;
    onClose();
  }

  function handleContinue() {
    if (!selectedId) {
      setError("Pick a resume to start from.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        // Tailor creates a new job-specific version on save — no intermediate
        // "(copy)" stub, so the library doesn't fill with Master Resume (copy).
        clearJobDraftLocal();
        await clearWorkspaceJobDraft();
        onClose();
        router.push(`/tailor?v=${selectedId}&new=1`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  if (!open) return null;

  const showSearch = versions.length >= SEARCH_THRESHOLD;
  const defaultVersion = sortedVersions.find((v) => v.id === defaultVersionId);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(13,15,20,0.55)] p-4 sm:p-6 backdrop-blur-[3px]"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-new-job-title"
        className="flex max-h-[min(90vh,720px)] w-[560px] max-w-full animate-[fadeUp_0.25s_ease_both] flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none border-b border-[#EEF0F3] px-6 pb-4 pt-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="apply-new-job-title"
                className="font-display text-[20px] font-semibold tracking-[-0.02em] text-ink"
              >
                {isStudent ? "Apply to a new opportunity" : "Apply to a new job"}
              </h2>
              <p className="mt-1.5 max-w-[420px] text-[13px] leading-[1.5] text-muted">
                {isStudent
                  ? "Pick a base resume. We'll create a new tailored version for this role — your original stays untouched."
                  : "Pick a base resume. We'll create a new tailored version for this posting — your original stays untouched."}
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

          {versions.length > 0 && showSearch ? (
            <div className="relative mt-4">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, company, or role…"
                aria-label="Search resumes"
                className="w-full rounded-[10px] border border-[#DFE3E8] bg-white py-2.5 pl-9 pr-3 text-[13px] text-ink placeholder:text-[#9AA3AF] focus:border-accent focus:outline-none"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA3AF]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </div>
          ) : null}

          {versions.length > 0 && defaultVersion && !query.trim() ? (
            <p className="mt-3 text-[12px] text-muted">
              Starting from your{" "}
              <span className="font-semibold text-ink">default resume</span> —
              pick another if you want a different base.
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3 sm:px-7">
          {versions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-5 py-8 text-center">
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
          ) : filteredVersions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-5 py-8 text-center">
              <p className="text-[14px] font-semibold text-ink">No matching resumes</p>
              <p className="mt-1.5 text-[13px] text-muted">
                Nothing matched “{query.trim()}”. Try a company or role name.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="cursor-pointer mt-3 border-none bg-transparent p-0 text-[13px] font-semibold text-accent hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-1.5" role="radiogroup" aria-label="Choose a resume to start from">
              {filteredVersions.map((version) => {
                const meta = versionCardMeta(version);
                const appCount = versionCounts[version.id] ?? 0;
                const selected = selectedId === version.id;
                const isDefault = version.id === defaultVersionId;
                const subtitle =
                  meta.tailored ||
                  (meta.headline !== "No headline yet" ? meta.headline : null);

                return (
                  <button
                    key={version.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSelectedId(version.id)}
                    className={`w-full cursor-pointer rounded-[12px] border px-3.5 py-2.5 text-left transition-colors ${
                      selected
                        ? "border-accent bg-[#F5F8FF] shadow-[0_0_0_1px_rgba(47,107,255,0.18)]"
                        : "border-transparent bg-[#FAFBFC] hover:border-[#E2E5EA] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border-2 ${
                          selected
                            ? "border-accent bg-accent text-[10px] font-bold text-white"
                            : "border-[#CBD2DB] bg-white"
                        }`}
                        aria-hidden
                      >
                        {selected ? "✓" : ""}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-[13.5px] font-bold text-ink">
                            {version.name}
                          </span>
                          {isDefault ? (
                            <span className="shrink-0 rounded-md bg-[#EEF3FF] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em] text-[#1E54E6]">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-[#8A92A0]">
                          {subtitle ? (
                            <span className="max-w-full truncate">{subtitle}</span>
                          ) : null}
                          {subtitle ? <span aria-hidden>·</span> : null}
                          <span className="shrink-0">{meta.updated.replace(/^Updated /, "")}</span>
                          {appCount > 0 ? (
                            <>
                              <span aria-hidden>·</span>
                              <span className="shrink-0 font-semibold text-[#2456D6]">
                                {appCount} app{appCount === 1 ? "" : "s"}
                              </span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error ? (
          <div className="flex-none border-t border-[#EEF0F3] px-6 py-3 sm:px-7">
            <div className="rounded-[10px] border border-[#F2D2D2] bg-[#FCECEC] px-3.5 py-2.5 text-[13px] text-[#B23B3B]">
              {error}
            </div>
          </div>
        ) : null}

        {versions.length > 0 ? (
          <div className="flex flex-none justify-end gap-2.5 border-t border-[#EEF0F3] bg-white px-6 py-4 sm:px-7">
            <button
              type="button"
              onClick={handleClose}
              disabled={pending}
              className="rounded-[11px] border border-[#DCE0E6] bg-white px-[16px] py-[10px] text-[13.5px] font-semibold text-[#3a4350] hover:bg-[#F4F5F7] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={pending || !selectedId}
              className="inline-flex items-center gap-2 rounded-[11px] bg-accent px-[16px] py-[10px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6] disabled:opacity-60"
            >
              {pending ? <Spinner /> : null}
              {pending ? "Opening…" : "Continue to tailor →"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
