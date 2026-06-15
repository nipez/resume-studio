"use client";

import { ResumePreview } from "@/components/resume/resume-preview";
import {
  JobCompanyField,
  JobDescField,
  JobRoleField,
  VersionSelect,
  errorBoxClass,
  mockBannerClass,
  primaryBtnClass,
} from "@/components/shared/job-fields";
import { JobUrlImport } from "@/components/shared/job-url-import";
import { Spinner } from "@/components/ui/spinner";
import { useJobDraft } from "@/lib/job-draft/use-job-draft";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { openPrintHtml } from "@/lib/resume/build-cover-html";
import { saveTailoredVersion } from "@/lib/resume/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import type { ResumeData } from "@/lib/types/resume";
import Link from "next/link";
import { useMemo, useState } from "react";

type TailorPanelProps = {
  versions: ResumeVersion[];
  defaultVersionId: string | null;
};

const DEPTH_OPTIONS = [
  {
    id: "light" as const,
    title: "Light",
    desc: "Summary, skills, top 3 roles",
  },
  {
    id: "deep" as const,
    title: "Deep",
    desc: "Every role rewritten",
  },
];

export function TailorPanel({ versions, defaultVersionId }: TailorPanelProps) {
  const { draft, update } = useJobDraft();
  const [baseId, setBaseId] = useState(
    defaultVersionId ?? versions[0]?.id ?? ""
  );
  const [depth, setDepth] = useState<"light" | "deep">("light");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mockMode, setMockMode] = useState(false);
  const [matchNotes, setMatchNotes] = useState("");
  const [resultId, setResultId] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ResumeData | null>(null);
  const [resultTemplate, setResultTemplate] = useState<"classic" | "twocol" | "editorial">("twocol");

  const base = versions.find((v) => v.id === baseId) ?? versions[0];

  const previewHtml = useMemo(() => {
    if (!resultData) return "";
    return buildResumeHTML({ templateStyle: resultTemplate, data: resultData }, false);
  }, [resultData, resultTemplate]);

  async function handleTailor() {
    if (!draft.jobDesc.trim()) {
      setError("Paste a job description first.");
      return;
    }
    if (!base) {
      setError("Create a resume version first.");
      return;
    }
    setBusy(true);
    setError("");
    setMatchNotes("");
    setResultId(null);
    setResultData(null);

    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: draft.jobRole,
          jobCompany: draft.jobCompany,
          jobDesc: draft.jobDesc,
          depth,
          data: base.data,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Tailoring failed");

      setMockMode(Boolean(j.mock));
      setMatchNotes(j.matchNotes);
      setResultTemplate(base.template_style);
      setResultData(j.data);

      const saved = await saveTailoredVersion({
        baseId: base.id,
        jobRole: draft.jobRole,
        jobCompany: draft.jobCompany,
        depth,
        data: j.data,
      });
      setResultId(saved.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleExport() {
    if (!resultData) return;
    openPrintHtml(
      buildResumeHTML({ templateStyle: resultTemplate, data: resultData }, true)
    );
  }

  if (!versions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
        <p className="text-[14px] text-muted">
          Create a resume in your library first, then come back to tailor it.
        </p>
        <Link
          href="/library"
          className="mt-4 inline-block text-[13.5px] font-semibold text-[#2456D6]"
        >
          Go to Resume Library →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-[#E6E8EC] bg-white p-[22px]">
        {mockMode ? (
          <div className={mockBannerClass}>
            Demo mode — add ANTHROPIC_API_KEY for production-quality tailoring.
          </div>
        ) : null}
        <VersionSelect versions={versions} value={baseId} onChange={setBaseId} />
        <JobUrlImport
          onImported={(fields) =>
            update({
              jobRole: fields.jobRole,
              jobCompany: fields.jobCompany,
              jobDesc: fields.jobDesc,
            })
          }
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
        <JobDescField
          value={draft.jobDesc}
          onChange={(v) => update({ jobDesc: v })}
        />
        <div className="mt-4">
          <div className="mb-2 text-[12.5px] font-semibold text-[#5A6573]">
            Tailoring depth
          </div>
          <div className="flex gap-2">
            {DEPTH_OPTIONS.map((o) => {
              const active = depth === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setDepth(o.id)}
                  className={`flex-1 rounded-[10px] border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-accent bg-[#EAF1FF] text-[#1E54E6]"
                      : "border-[#E2E5EA] bg-[#FAFBFC] text-[#5A6573] hover:border-[#CFD5DD]"
                  }`}
                >
                  <div className="text-[13px] font-bold">{o.title}</div>
                  <div className="mt-[3px] text-[11.5px] leading-[1.35] opacity-85">
                    {o.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {error ? <div className={errorBoxClass}>{error}</div> : null}
        <button
          type="button"
          onClick={handleTailor}
          disabled={busy}
          className={primaryBtnClass}
        >
          {busy ? <Spinner /> : null}
          {busy ? "Tailoring…" : "Tailor resume"}
        </button>
      </div>

      <div className="flex min-h-[300px] flex-col gap-4">
        {resultData ? (
          <>
            <div className="animate-[fadeUp_0.4s_ease_both] rounded-2xl bg-sidebar px-[22px] py-5 text-[#E4E8EE]">
              <div className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-[#9FC0FF]">
                ✦ Why this fits
              </div>
              <p className="text-[13.6px] leading-[1.6] text-[#C7CDD6]">{matchNotes}</p>
              <div className="mt-4 flex gap-2">
                {resultId ? (
                  <Link
                    href={`/editor/${resultId}`}
                    className="rounded-[9px] bg-accent px-[15px] py-2 text-[13px] font-semibold text-white hover:bg-[#1E54E6]"
                  >
                    Open in editor
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={handleExport}
                  className="rounded-[9px] bg-white/10 px-[15px] py-2 text-[13px] font-semibold text-white hover:bg-white/[0.18]"
                >
                  ↓ Export PDF
                </button>
              </div>
            </div>
            <div className="h-[760px] overflow-hidden rounded-2xl bg-[#EAECEF] p-4">
              <div className="h-full overflow-hidden rounded-[5px] bg-white shadow-[0_4px_20px_rgba(15,17,22,0.1)]">
                <ResumePreview html={previewHtml} title="Tailored resume preview" />
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border-[1.5px] border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-7 py-12 text-center text-[#8A92A0]">
            <div className="mb-2.5 text-[34px] opacity-60">⌖</div>
            <div className="font-display text-[15px] font-semibold text-[#5A6573]">
              Your tailored resume appears here
            </div>
            <div className="mt-1.5 text-[13px]">
              It&apos;s saved as a new version in your library, so the original stays
              untouched.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
