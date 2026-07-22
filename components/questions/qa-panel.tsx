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
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type TextareaHTMLAttributes,
} from "react";

type QAPanelProps = {
  versions: ResumeVersion[];
  defaultVersionId: string | null;
  /** When set (tailored resume id), show the prep-flow stepper and log CTA. */
  prepFlowResultId?: string | null;
  savedJobId?: string | null;
  isStudent?: boolean;
};

function AutoGrowTextarea({
  value,
  className = "",
  minRows = 2,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    const minHeight = minRows * 24 + 20;
    el.style.height = `${Math.max(minHeight, el.scrollHeight)}px`;
  }, [value, minRows]);

  return (
    <textarea
      {...props}
      ref={ref}
      value={value}
      rows={minRows}
      className={`block w-full resize-none overflow-hidden ${className}`}
    />
  );
}

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
  const answeredCount = items.filter((i) => i.a.trim()).length;
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
            .
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
            <span className="font-semibold">{jobLabel || "this role"}</span>.
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

      <div className="mb-5 rounded-xl border border-[#E8ECF1] bg-[#FAFBFC] px-4 py-3">
        <button
          type="button"
          onClick={() => setContextOpen((open) => !open)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 border-none bg-transparent p-0 text-left"
          aria-expanded={contextOpen}
        >
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-ink">
              {jobLabel || "Add role and company"}
            </div>
            <div className="mt-0.5 truncate text-[12.5px] text-muted">
              Using {base?.name ?? "resume"} for answers
            </div>
          </div>
          <span className="flex-none text-[12.5px] font-semibold text-[#2456D6]">
            {contextOpen ? "Done" : "Edit context"}
          </span>
        </button>

        {contextOpen ? (
          <div className="mt-3 space-y-3.5 border-t border-[#E8ECF1] bg-white px-1 pt-3">
            <VersionSelect
              versions={versions}
              value={baseId}
              onChange={setBaseId}
              label="Resume context"
              id="qa-base"
            />
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              rows={3}
              label="Job description (optional)"
            />
          </div>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#E6E8EC] bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF0F3] px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-ink">
              Portal questions
            </h2>
            <p className="mt-1 text-[13px] text-muted">
              {filledCount === 0
                ? "Paste each screening question, then generate an answer."
                : `${filledCount} question${filledCount === 1 ? "" : "s"}${
                    answeredCount
                      ? ` · ${answeredCount} answered`
                      : " · none answered yet"
                  }`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filledCount > 0 || answeredCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-[9px] border border-transparent px-3 py-2 text-[13px] font-semibold text-[#8A92A0] hover:bg-[#F4F5F7] hover:text-ink"
              >
                Clear all
              </button>
            ) : null}
            <button
              type="button"
              onClick={answerAll}
              disabled={anyBusy || filledCount === 0}
              className="rounded-[9px] bg-accent px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-60"
            >
              {anyBusy ? "Answering…" : "Answer all"}
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#EEF0F3]">
          {items.map((q, index) => {
            const busy = busyIds.has(q.id);
            const hasAnswer = Boolean(q.a.trim());
            return (
              <article key={q.id} className="px-5 py-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-[12px] font-semibold text-[#8A92A0]">
                    Question {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[#B23B3B] hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <AutoGrowTextarea
                  value={q.q}
                  onChange={(e) => updateItem(q.id, { q: e.target.value })}
                  minRows={2}
                  placeholder="Paste the portal question here…"
                  className="rounded-xl border border-[#E2E5EA] bg-[#FAFBFC] px-3.5 py-3 text-[14.5px] font-medium leading-[1.55] text-ink placeholder:font-normal placeholder:text-[#9AA3AF] focus:border-accent focus:bg-white focus:outline-none"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => answerOne(q.id)}
                    disabled={busy || !q.q.trim()}
                    className="inline-flex items-center gap-1.5 rounded-[9px] bg-accent px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-60"
                  >
                    {busy ? <Spinner className="h-3.5 w-3.5" /> : null}
                    {busy ? "Writing…" : hasAnswer ? "Regenerate" : "Generate answer"}
                  </button>
                  {hasAnswer ? (
                    <button
                      type="button"
                      onClick={() => copyAnswer(q.a)}
                      className="rounded-[9px] border border-[#E4E7EC] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#3a4350] hover:border-[#C8CED6]"
                    >
                      Copy answer
                    </button>
                  ) : null}
                </div>

                {hasAnswer ? (
                  <div className="mt-4 border-t border-[#F0F2F5] pt-4">
                    <div className="mb-2 text-[12px] font-semibold text-[#8A92A0]">
                      Your answer
                    </div>
                    <AutoGrowTextarea
                      value={q.a}
                      onChange={(e) => updateItem(q.id, { a: e.target.value })}
                      minRows={4}
                      className="rounded-xl bg-[#F7F9FC] px-3.5 py-3 font-sans text-[14.5px] leading-[1.7] text-[#1a1f29] focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="border-t border-[#EEF0F3] px-5 py-4">
          <button
            type="button"
            onClick={addQuestion}
            className="cursor-pointer border-none bg-transparent p-0 text-[13.5px] font-semibold text-[#2456D6] hover:underline"
          >
            + Add another question
          </button>
        </div>
      </section>

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </>
  );
}
