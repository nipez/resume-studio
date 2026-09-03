"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Toast } from "@/components/ui/toast";
import { parseJsonResponse } from "@/lib/api/parse-response";
import type { RebuildMasterSource } from "@/lib/resume/rebuild-master-sources";
import { formatRebuildSourceLabel } from "@/lib/resume/rebuild-master-sources";
import { useRouter } from "next/navigation";
import { useState } from "react";

type RebuildMasterButtonProps = {
  sources: RebuildMasterSource[];
};

export function RebuildMasterButton({ sources }: RebuildMasterButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const disabled = sources.length === 0;
  const sourcePreview = sources
    .slice(0, 6)
    .map((source) => formatRebuildSourceLabel(source))
    .join("; ");
  const moreCount = Math.max(0, sources.length - 6);

  async function handleRebuild() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/rebuild-master", { method: "POST" });
      const payload = await parseJsonResponse<{
        error?: string;
        sourceCount?: number;
      }>(res);

      if (!res.ok) {
        throw new Error(payload.error || "Could not rebuild master resume.");
      }

      setConfirmOpen(false);
      setToast(
        `Master resume updated from ${payload.sourceCount ?? sources.length} recent ${
          (payload.sourceCount ?? sources.length) === 1 ? "cut" : "cuts"
        }`
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const description = [
    `We'll merge your ${sources.length} most recent tailored or application-linked resume${
      sources.length === 1 ? "" : "s"
    } into your primary resume — keeping your contact info and pulling in the strongest bullets, skills, and phrasing.`,
    sourcePreview
      ? `Sources: ${sourcePreview}${moreCount > 0 ? `; +${moreCount} more` : ""}.`
      : "",
    "Your primary resume is updated in place. Past application snapshots are unchanged.",
    error,
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setError("");
          setConfirmOpen(true);
        }}
        title={
          disabled
            ? "Tailor a few roles or log applications first"
            : "Merge your recent tailored cuts into your primary resume"
        }
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4C8FF] bg-[#F7F4FF] px-4 py-2.5 text-[13.5px] font-semibold text-[#5638E0] transition-colors hover:border-[#B8A8FF] hover:bg-[#F0ECFF] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Rebuild master
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Rebuild your master resume?"
        description={description}
        confirmLabel={busy ? "Rebuilding…" : "Rebuild master"}
        pending={busy}
        onConfirm={() => void handleRebuild()}
        onCancel={() => {
          if (busy) return;
          setConfirmOpen(false);
          setError("");
        }}
      />

      {busy ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-4 shadow-lg">
            <Spinner />
            <span className="text-[14px] font-semibold text-ink">
              Rebuilding master resume…
            </span>
          </div>
        </div>
      ) : null}

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </>
  );
}
