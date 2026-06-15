"use client";

import type { ResumeData } from "@/lib/types/resume";
import type { ResumeEditSection } from "@/lib/types/resume-editor";
import { useEffect, useState } from "react";

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
  const [headlineOptions, setHeadlineOptions] = useState<string[]>([]);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  // Reset transient AI output when the active section changes.
  useEffect(() => {
    setError("");
    setAnswer("");
    setSuggestions([]);
    setHeadlineOptions([]);
    setApplyingIndex(null);
    setAppliedIndex(null);
  }, [section.id, section.index]);

  const canApplySuggestion =
    section.id === "header" ||
    section.id === "summary" ||
    section.id === "skills" ||
    (section.id === "experience" && section.index !== undefined);

  function applyForSection(json: {
    text?: string;
    headline?: string;
    skills?: string[];
    blurb?: string;
    bullets?: string[];
  }) {
    if (section.id === "summary") {
      onApplySummary(json.text ?? "");
    } else if (section.id === "header") {
      onApplyHeadline(json.headline ?? json.text ?? "");
    } else if (section.id === "skills") {
      onApplySkills(json.skills ?? []);
    } else if (section.id === "experience" && section.index !== undefined) {
      onApplyBullets(section.index, json.blurb ?? "", json.bullets ?? []);
    }
  }

  async function run(
    action: string,
    opts?: { question?: string; suggestion?: string; suggestionIndex?: number }
  ) {
    if (action === "apply-suggestion" && opts?.suggestionIndex !== undefined) {
      setApplyingIndex(opts.suggestionIndex);
    } else {
      setLoading(action);
    }
    setError("");
    try {
      const res = await fetch("/api/ai/resume-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          data,
          section: section.id,
          experienceIndex: section.index,
          question: opts?.question,
          suggestion: opts?.suggestion,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");

      if (action === "apply-suggestion") {
        applyForSection(json);
        if (opts?.suggestionIndex !== undefined) {
          setAppliedIndex(opts.suggestionIndex);
        }
        return;
      }
      if (action === "polish-bullets" && section.index !== undefined) {
        onApplyBullets(section.index, json.blurb ?? "", json.bullets ?? []);
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
        const options: string[] = Array.isArray(json.options)
          ? json.options
          : json.text
            ? [json.text]
            : [];
        setHeadlineOptions(options);
        return;
      }
      if (action === "ask") {
        setAnswer(json.text ?? "");
        return;
      }
      if (action === "suggest") {
        setAppliedIndex(null);
        setSuggestions(json.suggestions ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
      setApplyingIndex(null);
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
            ? { label: "Polish bullets", action: "polish-bullets" as const }
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
            onClick={() => run(primaryAction.action)}
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

      {/* Headline options — pick one to insert */}
      {section.id === "header" && headlineOptions.length ? (
        <div className="mt-3">
          <div className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#5A6573]">
            Pick a headline
          </div>
          <ul className="space-y-1.5">
            {headlineOptions.map((option, i) => (
              <li
                key={`${option}-${i}`}
                className="flex items-center gap-2 rounded-lg border border-[#DFE8FF] bg-white px-3 py-2"
              >
                <span className="flex-1 text-[12.5px] leading-snug text-[#3a4250]">
                  {option}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onApplyHeadline(option);
                    setHeadlineOptions([]);
                  }}
                  className="flex-none cursor-pointer rounded-md border-none bg-accent px-2.5 py-1 text-[11.5px] font-semibold text-white hover:bg-[#1E54E6]"
                >
                  Use
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
          {suggestions.map((item, i) => (
            <li
              key={item}
              className="rounded-lg border border-[#DFE8FF] bg-white px-3 py-2.5 text-[12.5px] leading-relaxed text-[#3a4250]"
            >
              <p>{item}</p>
              {canApplySuggestion ? (
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={applyingIndex !== null}
                    onClick={() =>
                      run("apply-suggestion", {
                        suggestion: item,
                        suggestionIndex: i,
                      })
                    }
                    className="cursor-pointer rounded-md border border-[#C8D8FF] bg-[#F5F8FF] px-2.5 py-1 text-[11.5px] font-semibold text-[#2456D6] transition-colors hover:bg-[#EAF1FF] disabled:opacity-50"
                  >
                    {applyingIndex === i
                      ? "Applying…"
                      : appliedIndex === i
                        ? "Apply again"
                        : "Apply this"}
                  </button>
                  {appliedIndex === i ? (
                    <span className="text-[11.5px] font-semibold text-[#0E7C4B]">
                      ✓ Applied
                    </span>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
