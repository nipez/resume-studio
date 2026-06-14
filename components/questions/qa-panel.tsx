"use client";

import { VersionSelect, mockBannerClass } from "@/components/shared/job-fields";
import { Spinner } from "@/components/ui/spinner";
import { Toast } from "@/components/ui/toast";
import {
  readQADraft,
  uid,
  writeQADraft,
  type QAItem,
} from "@/lib/job-draft/storage";
import { useJobDraft } from "@/lib/job-draft/use-job-draft";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { useCallback, useState } from "react";

type QAPanelProps = {
  versions: ResumeVersion[];
  defaultVersionId: string | null;
};

export function QAPanel({ versions, defaultVersionId }: QAPanelProps) {
  const { draft, update } = useJobDraft();
  const [baseId, setBaseId] = useState(
    defaultVersionId ?? versions[0]?.id ?? ""
  );
  const [items, setItems] = useState<QAItem[]>(() => readQADraft());
  const [mockMode, setMockMode] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const base = versions.find((v) => v.id === baseId) ?? versions[0];
  const anyBusy = busyIds.size > 0;

  const persistItems = useCallback((next: QAItem[]) => {
    setItems(next);
    writeQADraft(next);
  }, []);

  function updateItem(id: string, patch: Partial<QAItem>) {
    persistItems(items.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  async function answerOne(id: string) {
    const item = items.find((q) => q.id === id);
    if (!item?.q.trim() || !base) return;
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
      updateItem(id, {
        a: err instanceof Error ? err.message : "Something went wrong.",
      });
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
    if (items.length <= 1) return;
    persistItems(items.filter((q) => q.id !== id));
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
      {mockMode ? (
        <div className={`${mockBannerClass} mb-4`}>
          Demo mode — add ANTHROPIC_API_KEY for answers in your voice.
        </div>
      ) : null}
      <div className="mb-[18px] flex flex-wrap items-end gap-3.5 rounded-[14px] border border-[#E6E8EC] bg-white px-[18px] py-4">
        <VersionSelect
          versions={versions}
          value={baseId}
          onChange={setBaseId}
          label="Resume context"
          id="qa-base"
        />
        <label className="flex min-w-[260px] flex-[2] flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
          Job description (optional context)
          <input
            value={draft.jobDesc}
            onChange={(e) => update({ jobDesc: e.target.value })}
            placeholder="Paste or reuse from the Tailor tab"
            className="rounded-[9px] border border-[#DFE3E8] px-[11px] py-[9px] text-[13.5px] focus:border-accent focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={answerAll}
          disabled={anyBusy}
          className="rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-60"
        >
          {anyBusy ? "Answering…" : "Answer all"}
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {items.map((q) => {
          const busy = busyIds.has(q.id);
          return (
            <div
              key={q.id}
              className="rounded-[14px] border border-[#E6E8EC] bg-white px-[18px] py-4"
            >
              <div className="flex items-start gap-2.5">
                <textarea
                  value={q.q}
                  onChange={(e) => updateItem(q.id, { q: e.target.value })}
                  rows={1}
                  placeholder="Paste an application question…"
                  className="min-h-[42px] flex-1 resize-y rounded-[9px] border border-[#E2E5EA] px-3 py-2.5 text-sm font-semibold leading-[1.4] text-[#1a1f29] focus:border-accent focus:outline-none"
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
