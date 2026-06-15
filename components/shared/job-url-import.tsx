"use client";

import { Spinner } from "@/components/ui/spinner";
import { errorBoxClass, mockBannerClass } from "@/components/shared/job-fields";
import { useState } from "react";

export type ImportedJobFields = {
  jobRole: string;
  jobCompany: string;
  jobDesc: string;
  jobUrl?: string;
};

type JobUrlImportProps = {
  onImported: (fields: ImportedJobFields) => void;
  className?: string;
  hint?: string;
  successMessage?: string;
};

type ImportMode = "url" | "paste";

function normalizeJobUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

export function JobUrlImport({
  onImported,
  className = "",
  hint,
  successMessage = "Imported — review the fields below.",
}: JobUrlImportProps) {
  const [mode, setMode] = useState<ImportMode>("url");
  const [url, setUrl] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mockMode, setMockMode] = useState(false);
  const [imported, setImported] = useState(false);

  const defaultHint =
    mode === "url"
      ? "Works best with company career pages (Greenhouse, Lever, etc.). Indeed and LinkedIn usually require Paste text."
      : "Copy the full job posting from your browser and paste it here — works with Indeed, LinkedIn, and anywhere else.";

  async function handleUrlFetch() {
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
        jobUrl: trimmed,
      });
      setImported(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      if (/indeed|linkedin|paste text/i.test(message)) {
        setMode("paste");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handlePasteParse() {
    if (pasteText.trim().length < 80) {
      setError("Paste more of the job description — at least a few sentences.");
      return;
    }

    setBusy(true);
    setError("");
    setImported(false);
    setMockMode(false);

    try {
      const res = await fetch("/api/job/import-from-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Parse failed");

      setMockMode(Boolean(json.mock));
      onImported({
        jobRole: json.jobRole ?? "",
        jobCompany: json.jobCompany ?? "",
        jobDesc: json.jobDesc ?? "",
        jobUrl: url.trim() ? normalizeJobUrl(url) : "",
      });
      setImported(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`mt-3.5 rounded-[12px] border border-[#E4EAFF] bg-gradient-to-br from-[#F8FAFF] to-white p-3.5 ${className}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-accent">✦</span>
          <span className="font-display text-[13px] font-semibold text-ink">
            Import job
          </span>
        </div>
        <div className="flex rounded-lg bg-[#EEF1F4] p-0.5">
          <ModeButton active={mode === "url"} onClick={() => setMode("url")}>
            URL
          </ModeButton>
          <ModeButton active={mode === "paste"} onClick={() => setMode("paste")}>
            Paste text
          </ModeButton>
        </div>
      </div>

      <p className="mb-2.5 text-[12px] leading-relaxed text-[#7A828F]">
        {hint ?? defaultHint}
      </p>

      {mockMode ? (
        <div className={`${mockBannerClass} mb-2.5`}>
          Demo mode — add ANTHROPIC_API_KEY for production-quality parsing.
        </div>
      ) : null}

      {mode === "url" ? (
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
              handleUrlFetch();
            }}
          />
          <button
            type="button"
            onClick={handleUrlFetch}
            disabled={busy}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[9px] bg-accent px-3.5 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#1E54E6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Spinner /> : null}
            {busy ? "Fetching…" : "Fetch"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value);
              setImported(false);
            }}
            rows={6}
            placeholder="Paste the full job description here — title, company, responsibilities, requirements…"
            className="w-full resize-y rounded-[9px] border border-[#DFE3E8] bg-white px-[11px] py-2.5 text-[13px] leading-relaxed text-ink focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={handlePasteParse}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-[9px] bg-accent px-3.5 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#1E54E6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Spinner /> : null}
            {busy ? "Parsing…" : "Parse job details"}
          </button>
        </div>
      )}

      {error ? <div className={`${errorBoxClass} mt-2.5`}>{error}</div> : null}

      {imported && !error ? (
        <p className="mt-2 text-[12px] font-semibold text-[#2456D6]">
          {successMessage}
        </p>
      ) : null}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
        active
          ? "bg-white text-[#2456D6] shadow-sm"
          : "text-[#5A6573] hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
