"use client";

import {
  JobCompanyField,
  JobDescField,
  JobRoleField,
  VersionSelect,
  errorBoxClass,
  mockBannerClass,
  primaryBtnClass,
} from "@/components/shared/job-fields";
import { JobDescParseButton } from "@/components/shared/job-desc-parse-button";
import { JobUrlImport } from "@/components/shared/job-url-import";
import { Spinner } from "@/components/ui/spinner";
import { Toast } from "@/components/ui/toast";
import {
  deleteCoverLetter,
  saveCoverLetter,
} from "@/lib/cover/actions";
import type { CoverLetter } from "@/lib/cover/types";
import { useJobDraft } from "@/lib/job-draft/use-job-draft";
import { buildCoverHTML, openPrintHtml } from "@/lib/resume/build-cover-html";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { useState } from "react";

type CoverPanelProps = {
  versions: ResumeVersion[];
  defaultVersionId: string | null;
  savedLetters?: CoverLetter[];
  initialVersionId?: string | null;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function CoverPanel({
  versions,
  defaultVersionId,
  savedLetters = [],
  initialVersionId = null,
}: CoverPanelProps) {
  const { draft, update } = useJobDraft();
  const [baseId, setBaseId] = useState(
    initialVersionId ?? defaultVersionId ?? versions[0]?.id ?? ""
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mockMode, setMockMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [letters, setLetters] = useState<CoverLetter[]>(savedLetters);
  const [currentLetterId, setCurrentLetterId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const base = versions.find((v) => v.id === baseId) ?? versions[0];

  async function handleGenerate() {
    if (!draft.jobDesc.trim()) {
      setError("Paste a job description first.");
      return;
    }
    if (!base) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: draft.jobRole,
          jobCompany: draft.jobCompany,
          jobDesc: draft.jobDesc,
          hiringManager: draft.coverHM,
          summary: base.data.summary,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Generation failed");
      setMockMode(Boolean(j.mock));
      update({ coverText: j.letter });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleCopy() {
    if (!draft.coverText) return;
    navigator.clipboard.writeText(draft.coverText).catch(() => {});
    setToast("Copied to clipboard");
  }

  function handleExport() {
    if (!draft.coverText || !base) return;
    openPrintHtml(
      buildCoverHTML(draft.coverText, {
        name: base.data.name,
        phone: base.data.phone,
        email: base.data.email,
        location: base.data.location,
      })
    );
  }

  async function handleSave() {
    if (!draft.coverText.trim()) {
      setError("Generate or write a letter before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await saveCoverLetter({
        id: currentLetterId ?? undefined,
        role: draft.jobRole,
        company: draft.jobCompany,
        body: draft.coverText,
        resumeVersionId: baseId || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const saved = result.letter;
      setLetters((prev) => {
        const without = prev.filter((l) => l.id !== saved.id);
        return [saved, ...without];
      });
      setCurrentLetterId(saved.id);
      setToast("Saved to your account");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't save. Try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function loadLetter(letter: CoverLetter) {
    update({
      coverText: letter.body,
      jobRole: letter.role,
      jobCompany: letter.company,
    });
    setCurrentLetterId(letter.id);
    if (letter.resume_version_id && versions.some((v) => v.id === letter.resume_version_id)) {
      setBaseId(letter.resume_version_id);
    }
    setError("");
  }

  function startNewLetter() {
    setCurrentLetterId(null);
    update({ coverText: "" });
    setError("");
  }

  async function removeLetter(id: string) {
    const prev = letters;
    setLetters((curr) => curr.filter((l) => l.id !== id));
    if (currentLetterId === id) setCurrentLetterId(null);
    try {
      const result = await deleteCoverLetter(id);
      if (!result.ok) {
        setLetters(prev);
        setError(result.error);
        return;
      }
      setToast("Deleted");
    } catch {
      setLetters(prev);
      setError("Couldn't delete. Try again.");
    }
  }

  if (!versions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center text-[14px] text-muted">
        Create a resume in your library first.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-2xl border border-[#E6E8EC] bg-white p-[22px]">
          {mockMode ? (
            <div className={mockBannerClass}>
              Demo mode — add ANTHROPIC_API_KEY for production-quality letters.
            </div>
          ) : null}
          <VersionSelect versions={versions} value={baseId} onChange={setBaseId} />
          <JobUrlImport
            urlOnly
            onImported={(fields) =>
              update({
                jobRole: fields.jobRole,
                jobCompany: fields.jobCompany,
                jobDesc: fields.jobDesc,
                jobUrl: fields.jobUrl ?? draft.jobUrl,
              })
            }
            hint="Career pages work via URL. For Indeed or LinkedIn, paste the full posting in the job description field below."
            successMessage="Imported — review the fields below, then generate."
          />
          <div className="mt-3.5 grid grid-cols-2 gap-3">
            <JobRoleField
              value={draft.jobRole}
              onChange={(v) => update({ jobRole: v })}
            />
            <JobCompanyField
              value={draft.jobCompany}
              onChange={(v) => update({ jobCompany: v })}
            />
          </div>
          <label className="mt-3.5 flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
            Hiring manager (optional)
            <input
              value={draft.coverHM}
              onChange={(e) => update({ coverHM: e.target.value })}
              placeholder="e.g. Dr. Jane Smith"
              className="rounded-[9px] border border-[#DFE3E8] px-[11px] py-2.5 text-sm focus:border-accent focus:outline-none"
            />
          </label>
          <JobDescField
            value={draft.jobDesc}
            onChange={(v) => update({ jobDesc: v })}
            rows={9}
          />
          <JobDescParseButton
            text={draft.jobDesc}
            onParsed={(fields) =>
              update({
                jobRole: fields.jobRole || draft.jobRole,
                jobCompany: fields.jobCompany || draft.jobCompany,
                jobDesc: fields.jobDesc,
                jobUrl: fields.jobUrl ?? draft.jobUrl,
              })
            }
            className="mt-2"
          />
          {error ? <div className={errorBoxClass}>{error}</div> : null}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={busy}
            className={primaryBtnClass}
          >
            {busy ? <Spinner /> : null}
            {busy ? "Writing…" : "Generate cover letter"}
          </button>

          <div className="mt-5 border-t border-[#EEF0F3] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-[#5A6573]">
                Saved cover letters
              </span>
              {currentLetterId ? (
                <button
                  type="button"
                  onClick={startNewLetter}
                  className="text-[12px] font-semibold text-accent hover:underline"
                >
                  + New
                </button>
              ) : null}
            </div>
            {letters.length === 0 ? (
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                Nothing saved yet. Generate a letter and click{" "}
                <span className="font-semibold text-[#3a4350]">
                  Save to account
                </span>{" "}
                to sync it to every device you sign in on.
              </p>
            ) : (
              <ul className="mt-2.5 flex max-h-[260px] flex-col gap-1.5 overflow-auto">
                {letters.map((letter) => {
                  const active = letter.id === currentLetterId;
                  return (
                    <li
                      key={letter.id}
                      className={`group flex items-center gap-1 rounded-[9px] border px-2.5 py-2 ${
                        active
                          ? "border-accent bg-[#F4F7FF]"
                          : "border-[#EAECEF] bg-white hover:border-[#D6DAE0]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => loadLetter(letter)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="truncate text-[13px] font-semibold text-[#1a1f29]">
                          {letter.title}
                        </div>
                        <div className="text-[11.5px] text-muted">
                          {formatWhen(letter.updated_at)}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLetter(letter.id)}
                        aria-label="Delete cover letter"
                        className="shrink-0 rounded-md px-1.5 py-1 text-[13px] text-[#9aa3af] hover:bg-[#F2F3F5] hover:text-[#e5484d]"
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="flex min-h-[560px] flex-col rounded-2xl border border-[#E6E8EC] bg-white p-2">
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <div className="font-display text-sm font-semibold text-[#5A6573]">
              Letter
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={!draft.coverText || saving}
                className={`flex items-center gap-1.5 rounded-lg px-[13px] py-[7px] text-[12.5px] font-semibold transition-colors ${
                  draft.coverText && !saving
                    ? "bg-accent text-white hover:bg-[#1E54E6]"
                    : "cursor-not-allowed bg-[#F2F3F5] text-[#AAB2BD]"
                }`}
              >
                {saving ? <Spinner /> : null}
                {saving
                  ? "Saving…"
                  : currentLetterId
                  ? "Save changes"
                  : "Save to account"}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!draft.coverText}
                className="rounded-lg bg-[#F2F3F5] px-[13px] py-[7px] text-[12.5px] font-semibold text-[#3a4350] hover:bg-[#E6E8EC] disabled:opacity-50"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={!draft.coverText}
                className="rounded-lg bg-accent px-[13px] py-[7px] text-[12.5px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-50"
              >
                ↓ Export PDF
              </button>
            </div>
          </div>
          <textarea
            value={draft.coverText}
            onChange={(e) => update({ coverText: e.target.value })}
            placeholder="Your generated cover letter will appear here — fully editable."
            className="mx-1.5 mb-1.5 min-h-[480px] flex-1 resize-none rounded-[11px] border-none bg-[#FCFCFD] p-[22px_26px] font-sans text-[14.5px] leading-[1.75] text-[#1a1f29] focus:outline-none"
          />
        </div>
      </div>
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </>
  );
}
