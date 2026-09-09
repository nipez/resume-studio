"use client";

import { Spinner } from "@/components/ui/spinner";
import { parseJsonResponse } from "@/lib/api/parse-response";
import { updateResumeVersion } from "@/lib/resume/actions";
import type { ResumeData } from "@/lib/types/resume";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TailorAiUpdateCardProps = {
  versionId: string;
  data: ResumeData;
  onApplied: (next: ResumeData) => void;
};

export function TailorAiUpdateCard({
  versionId,
  data,
  onApplied,
}: TailorAiUpdateCardProps) {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [undoData, setUndoData] = useState<ResumeData | null>(null);

  async function handleApply() {
    const updateRequest = request.trim();
    if (!updateRequest || busy) return;

    setBusy(true);
    setError("");
    setToast(null);
    try {
      const res = await fetch("/api/ai/resume-update-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, updateRequest }),
      });
      const payload = await parseJsonResponse<{
        data?: ResumeData;
        error?: string;
        mock?: boolean;
      }>(res);

      if (!res.ok || !payload.data) {
        throw new Error(payload.error || "Could not apply that update.");
      }

      setUndoData(data);
      await updateResumeVersion(versionId, { data: payload.data });
      onApplied(payload.data);
      setRequest("");
      setToast(
        payload.mock
          ? "Update applied (demo mode)"
          : "Update applied to this tailored resume"
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUndo() {
    if (!undoData || busy) return;
    setBusy(true);
    setError("");
    try {
      await updateResumeVersion(versionId, { data: undoData });
      onApplied(undoData);
      setUndoData(null);
      setToast("Reverted last AI update");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not undo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#D9E4FF] bg-[#F7F9FF] px-5 py-4">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
        <span aria-hidden>✦</span>
        Request an AI update
      </div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
        Describe a change and we&apos;ll update this tailored resume in place —
        title renames, bullet tweaks, summary edits, and more.
      </p>

      <textarea
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        rows={3}
        disabled={busy}
        placeholder='e.g. Change my VP Marketing title at Bridgeview to say Head of Marketing'
        className="mt-3 w-full resize-y rounded-[10px] border border-[#D5DBE4] bg-white px-3 py-2.5 text-[13px] leading-[1.55] text-ink placeholder:text-[#9AA3AF] focus:border-accent focus:outline-none disabled:opacity-60"
      />

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy || !request.trim()}
          onClick={() => void handleApply()}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[9px] border-none bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1E54E6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? <Spinner className="h-3.5 w-3.5" /> : null}
          {busy ? "Updating…" : "Apply update"}
        </button>
        {undoData ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleUndo()}
            className="cursor-pointer rounded-[9px] border border-[#D5DBE4] bg-white px-3.5 py-2.5 text-[13px] font-semibold text-ink hover:border-[#C0C7D2] disabled:opacity-50"
          >
            Undo last update
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-2 text-[12.5px] font-semibold text-[#B23B3B]">{error}</p>
      ) : null}
      {toast ? (
        <p className="mt-2 text-[12.5px] font-semibold text-[#0E7C4B]">{toast}</p>
      ) : null}
    </div>
  );
}
