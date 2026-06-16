"use client";

import { Spinner } from "@/components/ui/spinner";
import type { Application, ApplicationAnswer } from "@/lib/applications/types";
import { uid } from "@/lib/job-draft/storage";
import { useEffect, useRef, useState, useTransition } from "react";

type LocalAnswer = ApplicationAnswer & { id: string };

type ApplicationAnswersEditorProps = {
  application: Application;
  onSave: (answers: ApplicationAnswer[]) => void;
};

function toLocal(answers: ApplicationAnswer[]): LocalAnswer[] {
  if (answers.length === 0) {
    return [{ id: uid(), q: "", a: "" }];
  }
  return answers.map((item) => ({ ...item, id: uid() }));
}

function toStored(items: LocalAnswer[]): ApplicationAnswer[] {
  return items
    .filter((item) => item.q.trim() || item.a.trim())
    .map(({ q, a }) => ({ q: q.trim(), a: a.trim() }));
}

export function ApplicationAnswersEditor({
  application,
  onSave,
}: ApplicationAnswersEditorProps) {
  const [items, setItems] = useState<LocalAnswer[]>(() => toLocal(application.answers));
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [mockMode, setMockMode] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setItems(toLocal(application.answers));
    // Reset local editor state only when opening a different application.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- not on every parent answers update
  }, [application.id]);

  function scheduleSave(next: LocalAnswer[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      startTransition(async () => {
        onSave(toStored(next));
      });
    }, 700);
  }

  function updateItems(updater: (prev: LocalAnswer[]) => LocalAnswer[]) {
    setItems((prev) => {
      const next = updater(prev);
      scheduleSave(next);
      return next;
    });
  }

  function addQuestion() {
    updateItems((prev) => [...prev, { id: uid(), q: "", a: "" }]);
  }

  function removeQuestion(id: string) {
    updateItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      return next.length > 0 ? next : [{ id: uid(), q: "", a: "" }];
    });
  }

  async function generateAnswer(id: string) {
    const item = items.find((entry) => entry.id === id);
    if (!item?.q.trim()) return;

    setBusyIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch("/api/ai/answer-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: application.role,
          jobCompany: application.company,
          jobDesc: application.job_desc,
          question: item.q,
          summary: application.resume_snapshot.data.summary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate answer");

      setMockMode(Boolean(data.mock));
      updateItems((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, a: String(data.answer ?? "") } : entry
        )
      );
    } catch (err) {
      updateItems((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                a: err instanceof Error ? err.message : "Something went wrong.",
              }
            : entry
        )
      );
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {mockMode ? (
        <p className="rounded-lg border border-[#D6E4FF] bg-[#EAF1FF] px-3 py-2 text-[12px] text-[#2456D6]">
          Demo AI mode — add ANTHROPIC_API_KEY for production answers.
        </p>
      ) : null}

      {items.map((item) => {
        const busy = busyIds.has(item.id);
        return (
          <div
            key={item.id}
            className="rounded-[11px] border border-[#EEF0F3] bg-[#FCFCFD] px-3.5 py-3"
          >
            <div className="flex items-start gap-2">
              <textarea
                value={item.q}
                onChange={(e) =>
                  updateItems((prev) =>
                    prev.map((entry) =>
                      entry.id === item.id ? { ...entry, q: e.target.value } : entry
                    )
                  )
                }
                rows={2}
                placeholder="Application question…"
                className="min-h-[44px] flex-1 resize-y rounded-[9px] border border-[#DFE3E8] px-3 py-2 text-[13px] font-semibold leading-[1.45] text-[#141821] focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                disabled={busy || !item.q.trim()}
                onClick={() => void generateAnswer(item.id)}
                className="flex h-[44px] shrink-0 items-center gap-1.5 rounded-[9px] bg-accent px-3 text-[12px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-60"
              >
                {busy ? <Spinner className="h-3 w-3 border-white/40 border-t-white" /> : null}
                {busy ? "…" : "✦ Answer"}
              </button>
              <button
                type="button"
                onClick={() => removeQuestion(item.id)}
                className="flex h-[44px] w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#FFF4F4] text-[13px] text-[#B23B3B] hover:bg-[#FCECEC]"
                aria-label="Remove question"
              >
                ✕
              </button>
            </div>
            <textarea
              value={item.a}
              onChange={(e) =>
                updateItems((prev) =>
                  prev.map((entry) =>
                    entry.id === item.id ? { ...entry, a: e.target.value } : entry
                  )
                )
              }
              rows={4}
              placeholder="Your answer — type it or use ✦ Answer to draft with AI…"
              className="mt-2.5 w-full resize-y rounded-[9px] border border-[#DFE3E8] bg-white px-3 py-2.5 text-[13px] leading-[1.6] text-[#3a4350] focus:border-accent focus:outline-none"
            />
          </div>
        );
      })}

      <button
        type="button"
        onClick={addQuestion}
        className="self-start rounded-[10px] border-none bg-[#EAF1FF] px-4 py-2.5 text-[13px] font-semibold text-[#2456D6] hover:bg-[#dbe7ff]"
      >
        + Add question
      </button>

      <p className="text-[11.5px] text-[#9AA3AF]">
        Saved to this application snapshot. Use Application Q&amp;A in the sidebar to
        draft answers before you apply, then paste them here after you send.
      </p>
    </div>
  );
}
