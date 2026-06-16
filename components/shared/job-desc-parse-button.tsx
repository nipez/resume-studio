"use client";

import { Spinner } from "@/components/ui/spinner";
import type { ImportedJobFields } from "@/components/shared/job-url-import";
import { useState } from "react";

type JobDescParseButtonProps = {
  text: string;
  onParsed: (fields: ImportedJobFields) => void;
  className?: string;
};

export function JobDescParseButton({
  text,
  onParsed,
  className = "",
}: JobDescParseButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleParse() {
    if (text.trim().length < 80) {
      setError("Paste more of the job description first — at least a few sentences.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/job/import-from-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Parse failed");

      onParsed({
        jobRole: json.jobRole ?? "",
        jobCompany: json.jobCompany ?? "",
        jobDesc: json.jobDesc ?? text.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={busy}
        onClick={handleParse}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D6E4FF] bg-[#F5F8FF] px-3 py-1.5 text-[12px] font-semibold text-[#2456D6] transition-colors hover:border-accent disabled:opacity-60"
      >
        {busy ? <Spinner className="h-3 w-3" /> : null}
        {busy ? "Parsing…" : "✦ Extract role & company from description"}
      </button>
      {error ? <p className="mt-1.5 text-[12px] text-[#B23B3B]">{error}</p> : null}
    </div>
  );
}
