"use client";

import { Spinner } from "@/components/ui/spinner";
import type { DiscoveryTarget } from "@/lib/discovery/types";
import { saveDiscoveryTargetToQueue } from "@/lib/discovery/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const priorityStyles: Record<
  DiscoveryTarget["priority"],
  { bg: string; fg: string; label: string }
> = {
  high: { bg: "#E8F5EE", fg: "#1B6B42", label: "High fit" },
  medium: { bg: "#FFF4E5", fg: "#9A5B00", label: "Medium fit" },
  low: { bg: "#F2F3F5", fg: "#5A6573", label: "Explore" },
};

type DiscoveryTargetCardProps = {
  target: DiscoveryTarget;
  saved?: boolean;
  onSaved?: () => void;
};

export function DiscoveryTargetCard({
  target,
  saved = false,
  onSaved,
}: DiscoveryTargetCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const style = priorityStyles[target.priority];

  function handleSave() {
    setError("");
    startTransition(async () => {
      try {
        await saveDiscoveryTargetToQueue(target);
        onSaved?.();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  async function handleCopySearch() {
    if (!target.linkedinSearch.trim()) return;
    try {
      await navigator.clipboard.writeText(target.linkedinSearch);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-[#E6E8EC] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-display text-[15px] font-semibold leading-snug text-ink">
            {target.company}
          </div>
          <div className="mt-0.5 text-[13px] font-semibold text-muted">
            {target.role || "Open role"}
          </div>
        </div>
        <span
          className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em]"
          style={{ background: style.bg, color: style.fg }}
        >
          {style.label}
        </span>
      </div>

      <p className="mt-3 text-[13px] leading-[1.55] text-muted">{target.rationale}</p>

      {target.researchSteps.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-[18px] text-[12.5px] leading-[1.5] text-[#3a4350]">
          {target.researchSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      ) : null}

      {target.careersHint ? (
        <p className="mt-3 text-[12px] text-[#8A92A0]">
          Careers: {target.careersHint}
        </p>
      ) : null}

      {error ? <p className="mt-2 text-[12px] text-[#B23B3B]">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {target.linkedinSearch ? (
          <button
            type="button"
            onClick={handleCopySearch}
            className="inline-flex cursor-pointer items-center rounded-[9px] border border-[#DFE3E8] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#3a4350] transition-colors hover:bg-[#F7F8FA]"
          >
            {copied ? "Copied search" : "Copy LinkedIn search"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={pending || saved}
          onClick={handleSave}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] border-none bg-accent px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Spinner className="h-3 w-3" />}
          {saved ? "Saved to queue" : "Save to queue"}
        </button>
      </div>
    </div>
  );
}
