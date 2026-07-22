"use client";

import { LogApplicationButton } from "@/components/applications/log-application-button";
import {
  JobCompanyField,
  JobDescField,
  JobRoleField,
  VersionSelect,
  mockBannerClass,
} from "@/components/shared/job-fields";
import { JobUrlImport } from "@/components/shared/job-url-import";
import { PrepFlowStepper } from "@/components/shared/prep-flow-stepper";
import { Spinner } from "@/components/ui/spinner";
import { Toast } from "@/components/ui/toast";
import { qaScopeKey, uid, type QAItem } from "@/lib/job-draft/storage";
import { useJobDraft } from "@/lib/job-draft/use-job-draft";
import { useQADraft } from "@/lib/job-draft/use-qa-draft";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { useEffect, useMemo, useState } from "react";

type QAPanelProps = {
  versions: ResumeVersion[];
  defaultVersionId: string | null;
  /** When set (tailored resume id), show the prep-flow stepper and log CTA. */
  prepFlowResultId?: string | null;
  savedJobId?: string | null;
  isStudent?: boolean;
};

export function QAPanel({
  versions,
  defaultVersionId,
  prepFlowResultId = null,
  savedJobId = null,
  isStudent = false,
}: QAPanelProps) {
  const { draft, update } = useJobDraft();
  const scopeKey = useMemo(
    () =>
      qaScopeKey({
        savedJobId,
        resultId: prepFlowResultId,
        jobRole: draft.jobRole,
        jobCompany: draft.jobCompany,
      }),
    [savedJobId, prepFlowResultId, draft.jobRole, draft.jobCompany]
  );
  const {
    items,
    persist: persistItems,
    clear,
    scopeReset,
    maybeStale,
    dismissScopeReset,
  } = useQADraft({ scopeKey });
  const [baseId, setBaseId] = useState(
    prepFlowResultId && versions.some((v) => v.id === prepFlowResultId)
      ? prepFlowResultId
      : (defaultVersionId ?? versions[0]?.id ?? "")
  );
  const [mockMode, setMockMode] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState("");
  const [prepStep, setPrepStep] = useState<4 | 5>(4);
  const [contextOpen, setContextOpen] = useState(!prepFlowResultId);

  const base = versions.find((v) => v.id === baseId) ?? versions[0];
  const anyBusy = busyIds.size > 0;
  const showPrepFlow = Boolean(prepFlowResultId);
  const filledCount = items.filter((i) => i.q.trim()).length;
  const jobLabel = [draft.jobRole.trim(), draft.jobCompany.trim()]
    .filter(Boolean)
    .join(" · ");

  useEffect(() => {
    if (!showPrepFlow) return;
    const syncHash = () => {
      setPrepStep(
        typeof window !== "undefined" && window.location.hash === "#log-application"
          ? 5
          : 4
      );
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    if (window.location.hash === "#log-application") {
      document.getElementById("log-application")?.scrollIntoView({ behavior: "smooth" });
    }
    return () => window.removeEventListener("hashchange", syncHash);
  }, [showPrepFlow]);

  function updateItem(id: string, patch: Partial<QAItem>) {
    persistItems(items.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  async function answerOne(id: string) {
    const item = items.find((q) => q.id === id);
    if (!item?.q.trim() || !base) return;
    setAnswerError("");
    setBusyIds((s) => new Set(s).add(id));
    updateItem(id, { a: item.a });
    try {
      const res = await fetch("/api/ai/answer-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: draft.jobRole,
          jobCompany: draft.jobCompany,
          jobDesc: draft.jobDesc,
          question: item.q,
          summary: base.data.summary,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setMockMode(Boolean(j.mock));
      updateItem(id, { a: j.answer });
    } catch (err) {
      setAnswerError(
        err instanceof Error ? err.message : "Something went wrong — try again."
      );
    } finally {
      setBusyIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  }

  async function answerAll() {
    for (const q of items.filter((i) => i.q.trim())) {
      await answerOne(q.id);
    }
  }

  function addQuestion() {
    persistItems([...items, { id: uid(), q: "", a: "" }]);
  }

  function removeQuestion(id: string) {
    if (items.length <= 1) {
      persistItems([{ id: uid(), q: "", a: "" }]);
      return;
    }
    persistItems(items.filter((q) => q.id !== id));
  }

  function clearAll() {
    if (filledCount === 0 && items.every((i) => !i.a.trim())) {
      clear();
      return;
    }
    if (
      !window.confirm(
        "Clear all questions and answers for this job? This doesn’t affect other applications."
      )
    ) {
      return;
    }
    clear();
    setToast("Cleared — ready for this application’s questions");
  }

  function copyAnswer(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setToast("Copied to clipboard");
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
      {showPrepFlow ? (
        <PrepFlowStepper
          currentStep={prepStep}
          resultId={prepFlowResultId}
          savedJobId={savedJobId}
          className="mb-5"
        />
      ) : null}

      {showPrepFlow && base ? (
        <div
          id="log-application"
          className="mb-5 scroll-mt-8 rounded-2xl border border-[#C8DAFF] bg-[#F4F8FF] px-5 py-4"
        >
          <div className="text-[14px] font-semibold text-ink">
            Step 5 — Log this application
          </div>
          <p className="mt-1 max-w-[640px] text-[13px] leading-[1.55] text-muted">
            Answer portal questions below if you need them, then log{" "}
            {draft.jobCompany?.trim() || "this role"} when you&apos;ve submitted
            online.
          </p>
          <div className="mt-3">
            <LogApplicationButton
              versionId={base.id}
              resumeVersionName={base.name}
              initialRole={draft.jobRole}
              initialCompany={draft.jobCompany}
              savedJobId={savedJobId ?? undefined}
              isStudent={isStudent}
              className="inline-flex items-center gap-1.5 rounded-[10px] border-none bg-accent px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6]"
            >
              Log application →
            </LogApplicationButton>
          </div>
        </div>
      ) : null}

      {scopeReset ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[#C8DAFF] bg-[#F4F8FF] px-3.5 py-2.5 text-[13px] text-[#1E54E6]">
          <span>
            Started a fresh Q&amp;A for{" "}
            <span className="font-semibold">
              {jobLabel || "this application"}
            </span>
            . Previous job answers were cleared.
          </span>
          <button
            type="button"
            onClick={dismissScopeReset}
            className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-semibold text-[#2456D6] hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {maybeStale && !scopeReset ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[#F1DDA6] bg-[#FEF3DA] px-3.5 py-2.5 text-[13px] text-[#9A6212]">
          <span>
            These questions may be from a previous application. Clear them if
            they aren&apos;t for{" "}
            <span className="font-semibold">
              {jobLabel || "this role"}
            </span>
            .
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clearAll}
              className="cursor-pointer rounded-lg border-none bg-[#9A6212] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#7E4F0E]"
            >
              Clear for this job
            </button>
            <button
              type="button"
              onClick={dismissScopeReset}
              className="cursor-pointer border-none bg-transparent p-0 text-[12.5px] font-semibold text-[#9A6212] hover:underline"
            >
              Keep
            </button>
          </div>
        </div>
      ) : null}

      {mockMode ? (
        <div className={`${mockBannerClass} mb-4`}>
          Demo mode — add ANTHROPIC_API_KEY for answers in your voice.
        </div>
      ) : null}
      {answerError ? (
        <div className="mb-4 rounded-[10px] border border-[#F2D2D2] bg-[#FCECEC] px-3.5 py-2.5 text-[13px] text-[#B23B3B]">
          {answerError}
        </div>
      ) : null}

      <div className="mb-4 rounded-[14px] border border-[#E6E8EC] bg-white px-[18px] py-4">
        <button
          type="button"
          onClick={() => setContextOpen((open) => !open)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent p-0 text-left"
          aria-expanded={contextOpen}
        >
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
              Job context
            </div>
            <div className="mt-1 truncate text-[14px] font-semibold text-ink">
              {jobLabel || "Add role and company"}
            </div>
            <div className="mt-0.5 truncate text-[12.5px] text-muted">
              Resume: {base?.name ?? "—"}
              {!contextOpen ? " · click to edit" : ""}
            </div>
          </div>
          <span className="flex-none text-[12.5px] font-semibold text-[#2456D6]">
            {contextOpen ? "Hide" : "Edit"}
          </span>
        </button>

        {contextOpen ? (
          <div className="mt-4 space-y-3.5 border-t border-[#EEF0F3] pt-4">
            <div className="flex flex-wrap items-end justify-between gap-3.5">
              <VersionSelect
                versions={versions}
                value={baseId}
                onChange={setBaseId}
                label="Resume context"
                id="qa-base"
              />
            </div>
            <JobUrlImport
              className="mt-0"
              onImported={(fields) =>
                update({
                  jobRole: fields.jobRole,
                  jobCompany: fields.jobCompany,
                  jobDesc: fields.jobDesc,
                  jobUrl: fields.jobUrl ?? draft.jobUrl,
                })
              }
              hint="Career pages work via URL. For Indeed or LinkedIn, use Paste text."
              successMessage="Imported — job context updated below."
            />
            <div className="grid grid-cols-2 gap-3">
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
              rows={4}
              label="Job description (optional context)"
            />
          </div>
        ) : null}
      </div>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-[17px] font-semibold text-ink">
            Portal questions
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            {jobLabel
              ? `For ${jobLabel} only — not carried over from other applications.`
              : "Paste screening questions from the online application."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={clearAll}
            className="rounded-[10px] border border-[#E4E7EC] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#5A6573] hover:border-[#C8CED6] hover:text-ink"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={answerAll}
            disabled={anyBusy || filledCount === 0}
            className="rounded-[10px] bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-60"
          >
            {anyBusy ? "Answering…" : "Answer all"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {items.map((q, index) => {
          const busy = busyIds.has(q.id);
          return (
            <div
              key={q.id}
              className="rounded-[14px] border border-[#E6E8EC] bg-white px-[18px] py-4"
            >
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#9AA3AF]">
                Question {index + 1}
              </div>
              <div className="flex items-start gap-2.5">
                <textarea
                  value={q.q}
                  onChange={(e) => updateItem(q.id, { q: e.target.value })}
                  rows={2}
                  placeholder="Paste an application question…"
                  className="min-h-[52px] flex-1 resize-y rounded-[9px] border border-[#E2E5EA] px-3 py-2.5 text-sm font-semibold leading-[1.45] text-[#1a1f29] focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => answerOne(q.id)}
                  disabled={busy || !q.q.trim()}
                  className="flex h-[42px] flex-none items-center gap-1.5 rounded-[9px] bg-accent px-3.5 text-[12.5px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-60"
                >
                  {busy ? <Spinner className="h-3 w-3" /> : null}
                  {busy ? "…" : "Answer"}
                </button>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="flex h-[42px] w-[38px] flex-none items-center justify-center rounded-[9px] bg-[#FFF4F4] text-[13px] text-[#B23B3B]"
                  aria-label="Remove question"
                >
                  ✕
                </button>
              </div>
              {q.a ? (
                <div className="relative mt-3 animate-[fadeUp_0.3s_ease_both] rounded-[11px] border border-[#EAEEF3] bg-[#F7F9FC] px-4 py-3.5">
                  <textarea
                    value={q.a}
                    onChange={(e) => updateItem(q.id, { a: e.target.value })}
                    className="min-h-[120px] w-full resize-y border-none bg-transparent font-sans text-[13.8px] leading-[1.65] text-[#1a1f29] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyAnswer(q.a)}
                    className="absolute right-2.5 top-2.5 rounded-[7px] border border-[#E2E5EA] bg-white px-[11px] py-[5px] text-[11.5px] font-semibold text-[#3a4350] hover:border-accent hover:text-accent"
                  >
                    Copy
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
        <button
          type="button"
          onClick={addQuestion}
          className="self-start rounded-[10px] border-none bg-[#EAF1FF] px-4 py-2.5 text-[13.5px] font-semibold text-[#2456D6] hover:bg-[#dbe7ff]"
        >
          + Add question
        </button>
      </div>
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </>
  );
}
