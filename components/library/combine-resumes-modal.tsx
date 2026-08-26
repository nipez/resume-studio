"use client";

import { ResumeContextNotesField } from "@/components/shared/resume-context-notes-field";
import {
  VersionSelect,
  errorBoxClass,
} from "@/components/shared/job-fields";
import { Spinner } from "@/components/ui/spinner";
import { parseJsonResponse } from "@/lib/api/parse-response";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CombineResumesModalProps = {
  open: boolean;
  onClose: () => void;
  versions: ResumeVersion[];
  defaultVersionId: string | null;
};

export function CombineResumesModal({
  open,
  onClose,
  versions,
  defaultVersionId,
}: CombineResumesModalProps) {
  const router = useRouter();
  const active = useMemo(
    () => versions.filter((version) => !version.archived_at),
    [versions]
  );

  const initialA = defaultVersionId ?? active[0]?.id ?? "";
  const initialB =
    active.find((version) => version.id !== initialA)?.id ?? "";

  const [sourceAId, setSourceAId] = useState(initialA);
  const [sourceBId, setSourceBId] = useState(initialB);
  const [emphasis, setEmphasis] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const nextA = defaultVersionId ?? active[0]?.id ?? "";
    const nextB = active.find((version) => version.id !== nextA)?.id ?? "";
    setSourceAId(nextA);
    setSourceBId(nextB);
    setEmphasis("");
    setName("");
    setError("");
  }, [open, defaultVersionId, active]);

  const sourceA = active.find((version) => version.id === sourceAId);
  const sourceB = active.find((version) => version.id === sourceBId);
  const canCombine =
    Boolean(sourceAId) && Boolean(sourceBId) && sourceAId !== sourceBId;

  function handleClose() {
    if (busy) return;
    setError("");
    onClose();
  }

  function swapSources() {
    setSourceAId(sourceBId);
    setSourceBId(sourceAId);
  }

  function handleSourceA(id: string) {
    setSourceAId(id);
    if (id === sourceBId) {
      const next = active.find((version) => version.id !== id);
      if (next) setSourceBId(next.id);
    }
  }

  function handleSourceB(id: string) {
    setSourceBId(id);
    if (id === sourceAId) {
      const next = active.find((version) => version.id !== id);
      if (next) setSourceAId(next.id);
    }
  }

  async function handleCombine() {
    if (!canCombine) {
      setError("Choose two different resumes to combine.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/combine-resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceAId,
          sourceBId,
          emphasis,
          name: name.trim() || undefined,
        }),
      });
      const payload = await parseJsonResponse<{
        error?: string;
        mock?: boolean;
        version?: { id: string; name: string };
      }>(res);
      if (!res.ok) {
        throw new Error(payload.error || "Could not combine those resumes.");
      }
      if (!payload.version?.id) {
        throw new Error("Combine finished but no new version was saved.");
      }
      onClose();
      router.push(`/editor/${payload.version.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(13,15,20,0.55)] p-6 backdrop-blur-[3px]"
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-[640px] max-w-full animate-[fadeUp_0.25s_ease_both] overflow-auto rounded-[18px] bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[21px] font-semibold tracking-[-0.02em] text-ink">
              Combine two resumes
            </h2>
            <p className="mt-[7px] max-w-[500px] text-[13.5px] leading-[1.5] text-muted">
              Blend two library versions into one hybrid — for example a
              marketing/growth master plus a product/AI cut. Sources stay
              untouched.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-[#F2F3F5] text-base text-[#5a6573] hover:bg-[#E6E8EC] disabled:opacity-60"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <VersionSelect
            id="combine-source-a"
            label="Primary resume"
            versions={active}
            value={sourceAId}
            onChange={handleSourceA}
            defaultVersionId={defaultVersionId}
            hint="Contact details and overall voice come from this version."
          />
          <button
            type="button"
            onClick={swapSources}
            disabled={busy || !sourceAId || !sourceBId}
            className="mb-6 hidden h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-[#DFE3E8] bg-white text-[15px] text-[#5A6573] hover:bg-[#F4F5F7] disabled:opacity-50 sm:inline-flex"
            title="Swap primary and second resume"
            aria-label="Swap primary and second resume"
          >
            ⇄
          </button>
          <VersionSelect
            id="combine-source-b"
            label="Second resume"
            versions={active}
            value={sourceBId}
            onChange={handleSourceB}
            defaultVersionId={defaultVersionId}
            hint="Unique roles, skills, and bullets are pulled in from here."
          />
        </div>

        <button
          type="button"
          onClick={swapSources}
          disabled={busy || !sourceAId || !sourceBId}
          className="mt-3 inline-flex cursor-pointer items-center rounded-[9px] border border-[#DFE3E8] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#5A6573] hover:bg-[#F4F5F7] disabled:opacity-50 sm:hidden"
        >
          Swap primary and second
        </button>

        {sourceA && sourceB && sourceAId !== sourceBId ? (
          <p className="mt-3 text-[12.5px] leading-snug text-[#8A92A0]">
            Combining <span className="font-semibold text-ink">{sourceA.name}</span>{" "}
            with <span className="font-semibold text-ink">{sourceB.name}</span>.
          </p>
        ) : null}

        <label className="mt-4 flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
          Hybrid name (optional)
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hybrid · Product + Growth"
            maxLength={120}
            className="rounded-[9px] border border-[#DFE3E8] px-[11px] py-2.5 text-sm font-normal text-ink focus:border-accent focus:outline-none"
          />
        </label>

        <ResumeContextNotesField
          className="mt-4"
          value={emphasis}
          onChange={setEmphasis}
          label="Emphasis (optional)"
          hint="e.g. Lean product/AI in the summary, but keep growth metrics from marketing roles."
        />

        {error ? <div className={errorBoxClass}>{error}</div> : null}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="rounded-[11px] border border-[#DCE0E6] bg-white px-[18px] py-[11px] text-[13.5px] font-semibold text-[#3a4350] hover:bg-[#F4F5F7] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCombine}
            disabled={busy || !canCombine}
            className="inline-flex items-center gap-2 rounded-[11px] bg-accent px-[18px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Spinner /> : null}
            {busy ? "Combining…" : "Create hybrid"}
          </button>
        </div>
      </div>
    </div>
  );
}
