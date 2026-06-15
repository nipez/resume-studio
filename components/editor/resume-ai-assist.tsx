"use client";

import type { ResumeData } from "@/lib/types/resume";
import type { ResumeEditSection } from "@/lib/types/resume-editor";
import { sectionKey } from "@/lib/types/resume-editor";
import { useEffect, useState } from "react";

export type AiApplyPatch = {
  headline?: string;
  summary?: string;
  skills?: string[];
  experience?: {
    index?: number;
    blurb?: string;
    bullets?: string[];
  };
};

type ResumeAiAssistProps = {
  section: ResumeEditSection;
  data: ResumeData;
  onApplySummary: (summary: string) => void;
  onApplyHeadline: (headline: string) => void;
  onApplySkills: (skills: string[]) => void;
  onApplyBullets: (index: number, blurb: string, bullets: string[]) => void;
  onApplyPatch: (patch: AiApplyPatch) => void;
};

export function ResumeAiAssist({
  section,
  data,
  onApplySummary,
  onApplyHeadline,
  onApplySkills,
  onApplyBullets,
  onApplyPatch,
}: ResumeAiAssistProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [headlineOptions, setHeadlineOptions] = useState<string[]>([]);
  const [appliedSuggestion, setAppliedSuggestion] = useState<number | null>(
    null
  );

  useEffect(() => {
    setError("");
    setAnswer("");
    setSuggestions([]);
    setHeadlineOptions([]);
    setAppliedSuggestion(null);
  }, [sectionKey(section)]);

  async function run(
    action: string,
    opts?: {
      question?: string;
      suggestion?: string;
      experienceIndex?: number;
      loadingKey?: string;
    }
  ): Promise<boolean> {
    const loadingKey = opts?.loadingKey ?? action;
    setLoading(loadingKey);
    setError("");
    try {
      const res = await fetch("/api/ai/resume-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          data,
          experienceIndex: opts?.experienceIndex ?? section.index,
          question: opts?.question,
          suggestion: opts?.suggestion,
          sectionId: section.id,
          sectionIndex: section.index,
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
        return true;
      }
      if (action === "suggest-skills") {
        onApplySkills(json.skills ?? []);
        return true;
      }
      if (action === "improve-summary") {
        onApplySummary(json.text ?? "");
        return true;
      }
      if (action === "improve-headline") {
        setHeadlineOptions(json.headlines ?? []);
        return true;
      }
      if (action === "ask") {
        setAnswer(json.text ?? "");
        return true;
      }
      if (action === "suggest") {
        setSuggestions(json.suggestions ?? []);
        setAppliedSuggestion(null);
        return true;
      }
      if (action === "implement-suggestion") {
        onApplyPatch(json.patch ?? {});
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
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

  const hasResults =
    headlineOptions.length > 0 ||
    suggestions.length > 0 ||
    !!answer ||
    !!error;

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
            Pick a headline option or apply an improvement with one click.
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

      {hasResults ? (
        <div className="scroll mt-3 max-h-[240px] space-y-2 overflow-y-auto pr-1">
          {error ? (
            <p className="text-[12px] text-[#B23B3B]">{error}</p>
          ) : null}

          {headlineOptions.length ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6573]">
                Choose a headline
              </p>
              {headlineOptions.map((headline, i) => (
                <button
                  key={`${headline}-${i}`}
                  type="button"
                  onClick={() => {
                    onApplyHeadline(headline);
                    setHeadlineOptions([]);
                  }}
                  className="flex w-full cursor-pointer flex-col gap-1.5 rounded-lg border border-[#DFE8FF] bg-white px-3 py-2.5 text-left transition-colors hover:border-accent hover:bg-[#F5F8FF]"
                >
                  <span className="text-[12.5px] leading-snug text-[#3a4250]">
                    {headline}
                  </span>
                  <span className="text-[11px] font-semibold text-[#2456D6]">
                    Use this headline →
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {suggestions.length ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6573]">
                Improvement ideas
              </p>
              {suggestions.map((item, i) => (
                <div
                  key={`${item}-${i}`}
                  className="rounded-lg border border-[#DFE8FF] bg-white px-3 py-2.5"
                >
                  <p className="text-[12.5px] leading-relaxed text-[#3a4250]">
                    {item}
                  </p>
                  <button
                    type="button"
                    disabled={
                      loading === `implement-${i}` || appliedSuggestion === i
                    }
                    onClick={async () => {
                      setAppliedSuggestion(null);
                      const ok = await run("implement-suggestion", {
                        suggestion: item,
                        loadingKey: `implement-${i}`,
                      });
                      if (ok) setAppliedSuggestion(i);
                    }}
                    className="mt-2 cursor-pointer rounded-lg border-none bg-[#EAF1FF] px-3 py-1.5 text-[12px] font-semibold text-[#2456D6] hover:bg-[#dbe7ff] disabled:opacity-50"
                  >
                    {loading === `implement-${i}`
                      ? "Applying…"
                      : appliedSuggestion === i
                        ? "Applied ✓"
                        : "Apply this idea"}
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {answer ? (
            <p className="rounded-lg border border-[#DFE8FF] bg-white px-3 py-2.5 text-[12.5px] leading-relaxed text-[#3a4250]">
              {answer}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
