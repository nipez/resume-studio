"use client";

import type { ResumeData } from "@/lib/types/resume";
import type { ResumeEditSection } from "@/lib/types/resume-editor";
import { useState } from "react";

type ResumeAiAssistProps = {
  section: ResumeEditSection;
  data: ResumeData;
  onApplySummary: (summary: string) => void;
  onApplyHeadline: (headline: string) => void;
  onApplySkills: (skills: string[]) => void;
  onApplyBullets: (index: number, blurb: string, bullets: string[]) => void;
};

export function ResumeAiAssist({
  section,
  data,
  onApplySummary,
  onApplyHeadline,
  onApplySkills,
  onApplyBullets,
}: ResumeAiAssistProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  async function run(
    action: string,
    opts?: { question?: string; experienceIndex?: number }
  ) {
    setLoading(action);
    setError("");
    try {
      const res = await fetch("/api/ai/resume-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          data,
          experienceIndex: opts?.experienceIndex,
          question: opts?.question,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");

      if (action === "polish-bullets" && opts?.experienceIndex !== undefined) {
        onApplyBullets(
          opts.experienceIndex,
          json.blurb ?? "",
          json.bullets ?? []
        );
        return;
      }
      if (action === "suggest-skills") {
        onApplySkills(json.skills ?? []);
        return;
      }
      if (action === "improve-summary") {
        onApplySummary(json.text ?? "");
        return;
      }
      if (action === "improve-headline") {
        onApplyHeadline(json.text ?? "");
        return;
      }
      if (action === "ask") {
        setAnswer(json.text ?? "");
        return;
      }
      if (action === "suggest") {
        setSuggestions(json.suggestions ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  const primaryAction =
    section.id === "summary"
      ? { label: "Improve this summary", action: "improve-summary" as const }
      : section.id === "header"
        ? { label: "Improve headline", action: "improve-headline" as const }
        : section.id === "skills"
          ? { label: "Suggest skills", action: "suggest-skills" as const }
          : section.id === "experience" && section.index !== undefined
            ? {
                label: "Polish bullets",
                action: "polish-bullets" as const,
                experienceIndex: section.index,
              }
            : null;

  return (
    <div className="rounded-xl border border-[#C8D8FF] bg-gradient-to-br from-[#EEF3FF] to-[#F7FAFF] p-4 shadow-[0_4px_16px_rgba(47,107,255,0.08)]">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-accent text-[15px] text-white shadow-[0_4px_12px_rgba(47,107,255,0.35)]">
          ✦
        </span>
        <div>
          <div className="font-display text-[14px] font-semibold text-ink">
            AI suggestions
          </div>
          <div className="mt-0.5 text-[12px] leading-snug text-[#5A6573]">
            Improve this section or ask for feedback — updates apply live.
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {primaryAction ? (
          <button
            type="button"
            disabled={loading === primaryAction.action}
            onClick={() =>
              run(primaryAction.action, {
                experienceIndex: primaryAction.experienceIndex,
              })
            }
            className="cursor-pointer rounded-[10px] border-none bg-accent px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] transition-colors hover:bg-[#1E54E6] disabled:opacity-50"
          >
            {loading === primaryAction.action
              ? "Working…"
              : primaryAction.label}
          </button>
        ) : null}

        <button
          type="button"
          disabled={loading === "suggest"}
          onClick={() => run("suggest")}
          className="cursor-pointer rounded-[10px] border border-[#C8D8FF] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#2456D6] transition-colors hover:bg-[#F5F8FF] disabled:opacity-50"
        >
          {loading === "suggest" ? "Working…" : "Get 3 improvement ideas"}
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask AI anything about this section…"
          className="min-w-0 flex-1 rounded-[10px] border border-[#C8D8FF] bg-white px-3 py-2.5 text-[13px] focus:border-accent focus:outline-none"
          onKeyDown={(e) => {
            if (e.key !== "Enter" || !question.trim()) return;
            e.preventDefault();
            run("ask", { question: question.trim() });
          }}
        />
        <button
          type="button"
          disabled={!question.trim() || loading === "ask"}
          onClick={() => run("ask", { question: question.trim() })}
          className="cursor-pointer rounded-[10px] border-none bg-[#2456D6] px-4 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-50"
        >
          {loading === "ask" ? "…" : "Ask"}
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-[12px] text-[#B23B3B]">{error}</p>
      ) : null}
      {answer ? (
        <p className="mt-3 rounded-lg border border-[#DFE8FF] bg-white px-3 py-2.5 text-[12.5px] leading-relaxed text-[#3a4250]">
          {answer}
        </p>
      ) : null}
      {suggestions.length ? (
        <ul className="mt-3 space-y-1.5">
          {suggestions.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-[#DFE8FF] bg-white px-3 py-2 text-[12.5px] leading-relaxed text-[#3a4250]"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
