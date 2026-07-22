"use client";

import { ResumePreview } from "@/components/resume/resume-preview";
import { EditableVersionName } from "@/components/library/editable-version-name";
import {
  JobCompanyField,
  JobDescField,
  JobRoleField,
  JobUrlField,
  VersionSelect,
  errorBoxClass,
  mockBannerClass,
  primaryBtnClass,
} from "@/components/shared/job-fields";
import { JobDescParseButton } from "@/components/shared/job-desc-parse-button";
import { JobUrlImport } from "@/components/shared/job-url-import";
import { PrepFlowStepper } from "@/components/shared/prep-flow-stepper";
import { ResumeContextNotesField } from "@/components/shared/resume-context-notes-field";
import { TailorProgressOverlay } from "@/components/tailor/tailor-progress-overlay";
import { Spinner } from "@/components/ui/spinner";
import { useJobDraft } from "@/lib/job-draft/use-job-draft";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { openPrintHtml } from "@/lib/resume/build-cover-html";
import { parseJsonResponse } from "@/lib/api/parse-response";
import { saveTailoredVersion } from "@/lib/resume/actions";
import { saveJobDraft } from "@/lib/job-draft/actions";
import { updateSavedJob } from "@/lib/saved-jobs/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import type { ResumeData } from "@/lib/types/resume";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TailorPanelProps = {
  versions: ResumeVersion[];
  defaultVersionId: string | null;
  initialVersionId?: string | null;
  initialResultVersion?: ResumeVersion | null;
  /** When true, clear the shared job draft and start a blank form. */
  startNewJob?: boolean;
  /** Links tailoring progress back to a saved job queue item. */
  savedJobId?: string | null;
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
  startNewJob = false,
  savedJobId = null,
}: TailorPanelProps) {
  const router = useRouter();
  const { draft, update, reset } = useJobDraft();
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
  >(initialResultVersion?.template_style ?? "classic");
  const [pendingSave, setPendingSave] = useState<{
    data: ResumeData;
    template: "classic" | "twocol" | "editorial";
    notes: string;
  } | null>(null);

  const base = versions.find((v) => v.id === baseId) ?? versions[0];
  const currentStep = phase === "result" && resultId ? 2 : 1;
  const handledNewJob = useRef(false);

  const hasDraftContent =
    Boolean(draft.jobDesc.trim()) ||
    Boolean(draft.jobRole.trim()) ||
    Boolean(draft.jobCompany.trim()) ||
    Boolean(draft.contextNotes.trim());

  const handleStartNewJob = useCallback(() => {
    reset();
    setPhase("input");
    setResultId(null);
    setResultData(null);
    setSavedName("");
    setMatchNotes("");
    setError("");
    setPendingSave(null);
    setSaveStatus("idle");
    router.replace("/tailor", { scroll: false });
  }, [reset, router]);

  useEffect(() => {
    if (!startNewJob || handledNewJob.current) return;
    handledNewJob.current = true;
    handleStartNewJob();
  }, [startNewJob, handleStartNewJob]);

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
      jobDesc: draft.jobDesc,
      jobUrl: draft.jobUrl,
      contextNotes: draft.contextNotes,
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
    await saveJobDraft({
      jobRole: draft.jobRole,
      jobCompany: draft.jobCompany,
      jobDesc: draft.jobDesc,
      jobUrl: draft.jobUrl,
      contextNotes: draft.contextNotes,
    });
    if (savedJobId) {
      await updateSavedJob(savedJobId, { tailoredVersionId: saved.id });
    }
    const jobQuery = savedJobId ? `&job=${savedJobId}` : "";
    router.replace(`/tailor?r=${saved.id}&v=${base.id}${jobQuery}`, { scroll: false });
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
      const j = await parseJsonResponse<{
        error?: string;
        data?: ResumeData;
        matchNotes?: string;
        mock?: boolean;
      }>(res);
      if (!res.ok) throw new Error(j.error || "Tailoring failed");
      if (!j.data) throw new Error("Tailoring returned no resume data.");

      const notes =
        j.matchNotes ||
        "Tailored to emphasize the most relevant experience for this role.";
      setMockMode(Boolean(j.mock));
      setMatchNotes(notes);

      try {
        // ATS-friendly Classic by default — switchable later in the editor.
        await persistTailoredVersion(j.data, "classic", notes);
      } catch (saveErr) {
        setResultData(j.data);
        setResultTemplate("classic");
        setPhase("result");
        setPendingSave({ data: j.data, template: "classic", notes });
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
    setSaveStatus("saving");
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
      <TailorProgressOverlay
        open={busy}
        depth={depth}
        phase={saveStatus === "tailoring" ? "tailoring" : "saving"}
        jobRole={draft.jobRole}
        jobCompany={draft.jobCompany}
      />

      <PrepFlowStepper
        currentStep={currentStep}
        resultId={resultId}
        savedJobId={savedJobId}
      />

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
                {saveStatus === "saved" && resultId ? (
                  <>
                    <div className="mt-1.5">
                      <EditableVersionName
                        versionId={resultId}
                        name={savedName}
                        compact
                        className="max-w-[420px]"
                      />
                      <p className="mt-1 text-[12.5px] leading-[1.45] text-[#3D6B4F]">
                        Saved for {draft.jobRole || "this role"}
                        {draft.jobCompany ? ` at ${draft.jobCompany}` : ""}. Click
                        the name to rename — your base resume is unchanged.
                      </p>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[13px] font-semibold">
                      <Link
                        href={`/editor/${resultId}`}
                        className="text-[#2456D6] hover:underline"
                      >
                        Open in editor
                      </Link>
                      <Link href="/library" className="text-[#2456D6] hover:underline">
                        View in library
                      </Link>
                      <button
                        type="button"
                        onClick={handleExport}
                        className="cursor-pointer rounded-[8px] border border-[#B8E6C8] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#1B5E36] hover:border-[#8FD4A8] hover:bg-[#F7FDF9]"
                      >
                        ↓ Export PDF
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-2.5">
                    <p className="mb-2 text-[13px] leading-[1.5] text-[#3D6B4F]">
                      Review the preview below. Save to your library before continuing.
                    </p>
                    <button
                      type="button"
                      onClick={handleExport}
                      className="cursor-pointer rounded-[8px] border border-[#B8E6C8] bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#1B5E36] hover:border-[#8FD4A8] hover:bg-[#F7FDF9]"
                    >
                      ↓ Export PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleStartNewJob}
              className="cursor-pointer border-none bg-transparent text-[12.5px] font-semibold text-[#5A6573] hover:text-[#2456D6]"
            >
              Start new job
            </button>
          </div>
        </div>
      ) : null}

      {phase === "result" && resultData ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-4">
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

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[12.5px] font-semibold text-[#5A6573]">
                  Tailored resume preview
                </div>
                {resultTemplate === "classic" ? (
                  <div className="mt-0.5 text-[11.5px] text-[#8A92A0]">
                    ATS-friendly Classic layout — switch templates in the editor.
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(47,107,255,0.3)] transition-colors hover:bg-[#1E54E6]"
              >
                ↓ Export PDF
              </button>
            </div>

            <div className="h-[min(820px,calc(100vh-220px))] min-h-[480px] overflow-hidden rounded-2xl bg-[#EAECEF] p-4">
              <div className="h-full overflow-hidden rounded-[5px] bg-white shadow-[0_4px_20px_rgba(15,17,22,0.1)]">
                <ResumePreview html={previewHtml} title="Tailored resume preview" />
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-8">
            <div className="rounded-2xl border border-[#E6E8EC] bg-white px-4 py-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A92A0]">
                Tailored for
              </div>
              <div className="mt-1 text-[14px] font-semibold text-ink">
                {draft.jobRole || "Role"}
                {draft.jobCompany ? ` at ${draft.jobCompany}` : ""}
              </div>
              {draft.jobUrl.trim() ? (
                <a
                  href={
                    /^https?:\/\//i.test(draft.jobUrl.trim())
                      ? draft.jobUrl.trim()
                      : `https://${draft.jobUrl.trim()}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-block truncate text-[12.5px] font-semibold text-[#2456D6] hover:underline"
                >
                  Open posting →
                </a>
              ) : null}
              <button
                type="button"
                onClick={() => setPhase("input")}
                className="mt-2 cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-semibold text-[#2456D6] hover:underline"
              >
                Edit job details
              </button>
            </div>

            <div className="rounded-2xl bg-sidebar px-5 py-4 text-[#E4E8EE]">
              <div className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-[#9FC0FF]">
                ✦ Why this fits
              </div>
              <p className="text-[13.4px] leading-[1.6] text-[#C7CDD6]">{matchNotes}</p>
            </div>

            {saveStatus === "saved" && resultId ? (
              <div className="rounded-2xl border border-[#E6E8EC] bg-white px-5 py-4">
                <div className="text-[13px] font-semibold text-ink">
                  Next — Cover letter or Q&amp;A
                </div>
                <p className="mt-1 text-[13px] leading-[1.5] text-muted">
                  {draft.jobCompany?.trim()
                    ? `Optional: write a cover letter for ${draft.jobCompany}. Many portals also ask screening questions — generate answers in Application Q&A before you log.`
                    : "Cover letter is optional. Many portals ask screening questions — generate answers in Application Q&A before you log."}{" "}
                  Job details carry over and this tailored resume is already saved.
                </p>
                <Link
                  href={`/cover?v=${resultId}${savedJobId ? `&job=${savedJobId}` : ""}`}
                  className="mt-3 inline-flex w-full justify-center rounded-[9px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1E54E6]"
                >
                  Continue to cover letter →
                </Link>
                <Link
                  href={`/questions?v=${resultId}${savedJobId ? `&job=${savedJobId}` : ""}`}
                  className="mt-2 inline-flex w-full justify-center rounded-[9px] border border-[#D5DBE4] bg-white px-4 py-2.5 text-[13px] font-semibold text-ink hover:border-[#C0C7D2] hover:bg-[#FAFBFC]"
                >
                  Skip cover letter → Application Q&amp;A
                </Link>
              </div>
            ) : null}
          </aside>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#E6E8EC] bg-white p-[22px]">
            {phase === "input" ? (
              <>
                {hasDraftContent ? (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E6E9EE] bg-[#FAFBFC] px-4 py-3">
                    <div className="text-[12.5px] leading-[1.45] text-[#5A6573]">
                      <span className="font-semibold text-ink">
                        {draft.jobRole || "Role"}
                        {draft.jobCompany ? ` at ${draft.jobCompany}` : ""}
                      </span>
                      <span className="text-muted">
                        {" "}
                        — carries over to Cover Letter while you work on this job.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartNewJob}
                      className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-semibold text-[#2456D6] hover:underline"
                    >
                      Start new job
                    </button>
                  </div>
                ) : null}
                {mockMode ? (
                  <div className={mockBannerClass}>
                    Demo mode — add ANTHROPIC_API_KEY for production-quality tailoring.
                  </div>
                ) : null}
                <VersionSelect
                  versions={versions}
                  value={baseId}
                  onChange={setBaseId}
                  defaultVersionId={defaultVersionId}
                  hint="Your base stays unchanged — tailored output saves as a new version named after the job."
                />
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
                <JobUrlField
                  value={draft.jobUrl}
                  onChange={(v) => update({ jobUrl: v })}
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
                </div>

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
      )}
    </div>
  );
}
