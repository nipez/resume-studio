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
import { JobDescParseButton } from "@/components/shared/job-desc-parse-button";
import { JobUrlImport } from "@/components/shared/job-url-import";
import { PrepFlowStepper } from "@/components/shared/prep-flow-stepper";
import { ResumeContextNotesField } from "@/components/shared/resume-context-notes-field";
import { Spinner } from "@/components/ui/spinner";
import { useJobDraft } from "@/lib/job-draft/use-job-draft";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { openPrintHtml } from "@/lib/resume/build-cover-html";
import { saveTailoredVersion } from "@/lib/resume/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import type { ResumeData } from "@/lib/types/resume";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type TailorPanelProps = {
  versions: ResumeVersion[];
  defaultVersionId: string | null;
  initialVersionId?: string | null;
  initialResultVersion?: ResumeVersion | null;
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

const MATCH_NOTES_KEY = (id: string) => `tailor_match_${id}`;

export function TailorPanel({
  versions,
  defaultVersionId,
  initialVersionId = null,
  initialResultVersion = null,
}: TailorPanelProps) {
  const router = useRouter();
  const { draft, update } = useJobDraft();
  const [baseId, setBaseId] = useState(
    initialVersionId ?? defaultVersionId ?? versions[0]?.id ?? ""
  );
  const [depth, setDepth] = useState<"light" | "deep">("light");
  const [phase, setPhase] = useState<"input" | "result">(
    initialResultVersion ? "result" : "input"
  );
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "tailoring" | "saving" | "saved" | "error"
  >(initialResultVersion ? "saved" : "idle");
  const [error, setError] = useState("");
  const [mockMode, setMockMode] = useState(false);
  const [matchNotes, setMatchNotes] = useState("");
  const [resultId, setResultId] = useState<string | null>(
    initialResultVersion?.id ?? null
  );
  const [savedName, setSavedName] = useState(initialResultVersion?.name ?? "");
  const [resultData, setResultData] = useState<ResumeData | null>(
    initialResultVersion?.data ?? null
  );
  const [resultTemplate, setResultTemplate] = useState<
    "classic" | "twocol" | "editorial"
  >(initialResultVersion?.template_style ?? "twocol");
  const [pendingSave, setPendingSave] = useState<{
    data: ResumeData;
    template: "classic" | "twocol" | "editorial";
    notes: string;
  } | null>(null);

  const base = versions.find((v) => v.id === baseId) ?? versions[0];
  const currentStep = phase === "result" && resultId ? 2 : 1;

  useEffect(() => {
    if (!initialResultVersion?.id) return;
    try {
      const cached = sessionStorage.getItem(MATCH_NOTES_KEY(initialResultVersion.id));
      if (cached) setMatchNotes(cached);
    } catch {
      // ignore
    }
  }, [initialResultVersion?.id]);

  const previewHtml = useMemo(() => {
    if (!resultData) return "";
    return buildResumeHTML({ templateStyle: resultTemplate, data: resultData }, false);
  }, [resultData, resultTemplate]);

  async function persistTailoredVersion(
    data: ResumeData,
    template: "classic" | "twocol" | "editorial",
    notes: string
  ) {
    if (!base) throw new Error("Create a resume version first.");
    setSaveStatus("saving");
    const saved = await saveTailoredVersion({
      baseId: base.id,
      jobRole: draft.jobRole,
      jobCompany: draft.jobCompany,
      depth,
      data,
    });
    try {
      sessionStorage.setItem(MATCH_NOTES_KEY(saved.id), notes);
    } catch {
      // ignore
    }
    setResultId(saved.id);
    setSavedName(saved.name);
    setResultData(data);
    setResultTemplate(template);
    setPhase("result");
    setSaveStatus("saved");
    setPendingSave(null);
    router.replace(`/tailor?r=${saved.id}&v=${base.id}`, { scroll: false });
    return saved;
  }

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
    setSaveStatus("tailoring");
    setPendingSave(null);

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
          contextNotes: draft.contextNotes,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Tailoring failed");

      const notes =
        j.matchNotes ||
        "Tailored to emphasize the most relevant experience for this role.";
      setMockMode(Boolean(j.mock));
      setMatchNotes(notes);

      try {
        await persistTailoredVersion(j.data, base.template_style, notes);
      } catch (saveErr) {
        setResultData(j.data);
        setResultTemplate(base.template_style);
        setPhase("result");
        setPendingSave({ data: j.data, template: base.template_style, notes });
        setSaveStatus("error");
        setError(
          saveErr instanceof Error
            ? `${saveErr.message} — retry saving below.`
            : "Couldn't save to your library. Retry below."
        );
      }
    } catch (err) {
      setSaveStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRetrySave() {
    if (!pendingSave) return;
    setBusy(true);
    setError("");
    try {
      await persistTailoredVersion(
        pendingSave.data,
        pendingSave.template,
        pendingSave.notes
      );
    } catch (err) {
      setSaveStatus("error");
      setError(err instanceof Error ? err.message : "Couldn't save. Try again.");
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
    <div className="space-y-5">
      <PrepFlowStepper currentStep={currentStep} resultId={resultId} />

      {phase === "result" && resultData ? (
        <div className="rounded-2xl border border-[#B8E6C8] bg-[#F0FBF4] px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#2E9B5B] text-sm text-white">
                ✓
              </span>
              <div>
                <div className="text-[14px] font-semibold text-[#1B5E36]">
                  {saveStatus === "saved"
                    ? "Step 2 — Saved to your library"
                    : "Step 2 — Review your tailored resume"}
                </div>
                {savedName && saveStatus === "saved" ? (
                  <p className="mt-1 text-[13px] leading-[1.5] text-[#3D6B4F]">
                    <strong>{savedName}</strong> is in your library. Your original
                    resume is unchanged — you can come back here anytime.
                  </p>
                ) : (
                  <p className="mt-1 text-[13px] leading-[1.5] text-[#3D6B4F]">
                    Review the preview below. Save to your library before continuing.
                  </p>
                )}
                {saveStatus === "saved" && resultId ? (
                  <div className="mt-2.5 flex flex-wrap gap-3 text-[13px] font-semibold">
                    <Link
                      href={`/editor/${resultId}`}
                      className="text-[#2456D6] hover:underline"
                    >
                      Open in editor
                    </Link>
                    <Link href="/library" className="text-[#2456D6] hover:underline">
                      View in library
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
            <Link
              href="/tailor"
              className="text-[12.5px] font-semibold text-[#5A6573] hover:text-[#2456D6]"
            >
              Start over
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E6E8EC] bg-white p-[22px]">
          {phase === "result" ? (
            <div className="mb-4 rounded-xl border border-[#E6E9EE] bg-[#FAFBFC] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A92A0]">
                Step 1 — Job details
              </div>
              <div className="mt-1 text-[14px] font-semibold text-ink">
                {draft.jobRole || "Role"}
                {draft.jobCompany ? ` at ${draft.jobCompany}` : ""}
              </div>
              <button
                type="button"
                onClick={() => setPhase("input")}
                className="mt-2 cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-semibold text-[#2456D6] hover:underline"
              >
                Edit job details
              </button>
            </div>
          ) : null}

          {phase === "input" ? (
            <>
              {mockMode ? (
                <div className={mockBannerClass}>
                  Demo mode — add ANTHROPIC_API_KEY for production-quality tailoring.
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
                successMessage="Imported — review the fields below, then tailor."
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
                label="Job description"
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
              <ResumeContextNotesField
                className="mt-4"
                value={draft.contextNotes}
                onChange={(v) => update({ contextNotes: v })}
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
                {busy
                  ? saveStatus === "saving"
                    ? "Saving to library…"
                    : "Tailoring…"
                  : "Tailor & save resume"}
              </button>
            </>
          ) : null}
        </div>

        <div className="flex min-h-[300px] flex-col gap-4">
          {resultData ? (
            <>
              {saveStatus === "error" && pendingSave ? (
                <div className={errorBoxClass}>
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={handleRetrySave}
                    disabled={busy}
                    className="mt-2 cursor-pointer rounded-[8px] border-none bg-[#B23B3B] px-3 py-1.5 text-[12.5px] font-semibold text-white"
                  >
                    {busy ? "Saving…" : "Retry save to library"}
                  </button>
                </div>
              ) : null}

              <div className="animate-[fadeUp_0.4s_ease_both] rounded-2xl bg-sidebar px-[22px] py-5 text-[#E4E8EE]">
                <div className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-[#9FC0FF]">
                  ✦ Why this fits
                </div>
                <p className="text-[13.6px] leading-[1.6] text-[#C7CDD6]">{matchNotes}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="rounded-[9px] bg-white/10 px-[15px] py-2 text-[13px] font-semibold text-white hover:bg-white/[0.18]"
                  >
                    ↓ Export PDF
                  </button>
                </div>
              </div>

              {saveStatus === "saved" && resultId ? (
                <div className="animate-[fadeUp_0.4s_ease_both] rounded-2xl border border-[#E6E8EC] bg-white px-5 py-4">
                  <div className="text-[13px] font-semibold text-ink">
                    Step 3 — Cover letter
                  </div>
                  <p className="mt-1 text-[13px] leading-[1.5] text-muted">
                    {draft.jobCompany?.trim()
                      ? `Write a cover letter for ${draft.jobCompany}, then log the application.`
                      : "Write a cover letter, then log the application."}{" "}
                    Job details carry over and this tailored resume is already saved.
                  </p>
                  <Link
                    href={`/cover?v=${resultId}`}
                    className="mt-3 inline-flex rounded-[9px] bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1E54E6]"
                  >
                    Continue to cover letter →
                  </Link>
                </div>
              ) : null}

              <div className="h-[760px] overflow-hidden rounded-2xl bg-[#EAECEF] p-4">
                <div className="h-full overflow-hidden rounded-[5px] bg-white shadow-[0_4px_20px_rgba(15,17,22,0.1)]">
                  <ResumePreview html={previewHtml} title="Tailored resume preview" />
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border-[1.5px] border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-7 py-12 text-center text-[#8A92A0]">
              <div className="mb-2.5 text-[34px] opacity-60">1</div>
              <div className="font-display text-[15px] font-semibold text-[#5A6573]">
                Step 1 — Add the job, then tailor & save
              </div>
              <div className="mt-1.5 text-[13px]">
                Your tailored resume saves to the library automatically. You can
                return to this step anytime from the progress bar above.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
