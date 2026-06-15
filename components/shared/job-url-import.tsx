"use client";

import { Spinner } from "@/components/ui/spinner";
import { errorBoxClass, mockBannerClass } from "@/components/shared/job-fields";
import { useState } from "react";

export type ImportedJobFields = {
  jobRole: string;
  jobCompany: string;
  jobDesc: string;
};

type JobUrlImportProps = {
  onImported: (fields: ImportedJobFields) => void;
};

function normalizeJobUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function JobUrlImport({ onImported }: JobUrlImportProps) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mockMode, setMockMode] = useState(false);
  const [imported, setImported] = useState(false);

  async function handleFetch() {
    const trimmed = normalizeJobUrl(url);
    if (!trimmed) {
      setError("Paste a job posting URL first.");
      return;
    }
    if (trimmed !== url.trim()) setUrl(trimmed);

    setBusy(true);
    setError("");
    setImported(false);
    setMockMode(false);

    try {
      const res = await fetch("/api/job/import-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Import failed");

      setMockMode(Boolean(json.mock));
      onImported({
        jobRole: json.jobRole ?? "",
        jobCompany: json.jobCompany ?? "",
        jobDesc: json.jobDesc ?? "",
      });
      setImported(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3.5 rounded-[12px] border border-[#E4EAFF] bg-gradient-to-br from-[#F8FAFF] to-white p-3.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[13px] text-accent">✦</span>
        <span className="font-display text-[13px] font-semibold text-ink">
          Import from URL
        </span>
      </div>
      <p className="mb-2.5 text-[12px] leading-relaxed text-[#7A828F]">
        Paste a public job posting link. We&apos;ll fill role, company, and
        description below — review before tailoring.
      </p>

      {mockMode ? (
        <div className={`${mockBannerClass} mb-2.5`}>
          Demo mode — add ANTHROPIC_API_KEY for production-quality parsing.
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setImported(false);
          }}
          placeholder="https://company.com/careers/role"
          className="min-w-0 flex-1 rounded-[9px] border border-[#DFE3E8] bg-white px-[11px] py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
          onKeyDown={(e) => {
            if (e.key !== "Enter" || busy) return;
            e.preventDefault();
            handleFetch();
          }}
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={busy}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[9px] bg-accent px-3.5 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#1E54E6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Spinner /> : null}
          {busy ? "Fetching…" : "Fetch"}
        </button>
      </div>

      {error ? <div className={`${errorBoxClass} mt-2.5`}>{error}</div> : null}

      {imported && !error ? (
        <p className="mt-2 text-[12px] font-semibold text-[#2456D6]">
          Imported — review the fields below, then tailor.
        </p>
      ) : null}
    </div>
  );
}
