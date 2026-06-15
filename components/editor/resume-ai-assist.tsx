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

type ResultPanel = "headline" | "suggestions" | "ask" | null;

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
  const [activePanel, setActivePanel] = useState<ResultPanel>(null);
  const [suggestPass, setSuggestPass] = useState(0);

  const activeSectionKey = sectionKey(section);

  useEffect(() => {
    setError("");
    setAnswer("");
    setSuggestions([]);
    setHeadlineOptions([]);
    setAppliedSuggestion(null);
    setActivePanel(null);
    setSuggestPass(0);
  }, [activeSectionKey]);

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

    if (action === "improve-headline") {
      setSuggestions([]);
      setActivePanel("headline");
    }
    if (action === "suggest") {
      setHeadlineOptions([]);
      setAppliedSuggestion(null);
      setActivePanel("suggestions");
      setSuggestions([]);
    }
    if (action === "ask") {
      setActivePanel("ask");
    }

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
        setActivePanel(null);
        return true;
      }
      if (action === "suggest-skills") {
        onApplySkills(json.skills ?? []);
        setActivePanel(null);
        return true;
      }
      if (action === "improve-summary") {
        onApplySummary(json.text ?? "");
        setActivePanel(null);
        return true;
      }
      if (action === "improve-headline") {
        const headlines = (json.headlines ?? []).filter(Boolean);
        if (!headlines.length) {
          throw new Error("No headline options returned — try again.");
        }
        setHeadlineOptions(headlines);
        setActivePanel("headline");
        return true;
      }
      if (action === "ask") {
        setAnswer(json.text ?? "");
        setActivePanel("ask");
        return true;
      }
      if (action === "suggest") {
        const next = (json.suggestions ?? []).filter(Boolean);
        if (!next.length) {
          throw new Error("No improvement ideas returned — try again.");
        }
        setSuggestions(next);
        setSuggestPass((n) => n + 1);
        setActivePanel("suggestions");
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
            Results appear right below the action you choose.
          </div>
        </div>
      </div>

      {error ? (
        <p className="mb-3 rounded-lg border border-[#F5D0D0] bg-[#FFF4F4] px-3 py-2 text-[12px] text-[#B23B3B]">
          {error}
        </p>
      ) : null}

      {primaryAction ? (
        <>
          <button
            type="button"
            disabled={loading === primaryAction.action}
            onClick={() =>
              run(primaryAction.action, {
                experienceIndex: primaryAction.experienceIndex,
              })
            }
            className="w-full cursor-pointer rounded-[10px] border-none bg-accent px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] transition-colors hover:bg-[#1E54E6] disabled:opacity-50"
          >
            {loading === primaryAction.action
              ? "Working…"
              : primaryAction.label}
          </button>

          {activePanel === "headline" && headlineOptions.length ? (
            <div className="scroll mt-3 max-h-[280px] space-y-2 overflow-y-auto rounded-lg border border-[#DFE8FF] bg-white/80 p-3 pr-2">
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
                    setActivePanel(null);
                  }}
                  className="flex w-full cursor-pointer flex-col gap-1.5 rounded-lg border border-[#E8EBEF] bg-white px-3 py-2.5 text-left transition-colors hover:border-accent hover:bg-[#F5F8FF]"
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
        </>
      ) : null}

      <button
        type="button"
        disabled={loading === "suggest"}
        onClick={() => run("suggest")}
        className={`w-full cursor-pointer rounded-[10px] border border-[#C8D8FF] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#2456D6] transition-colors hover:bg-[#F5F8FF] disabled:opacity-50 ${
          primaryAction ? "mt-2" : ""
        }`}
      >
        {loading === "suggest"
          ? "Working…"
          : suggestions.length
            ? "Refresh improvement ideas"
            : "Get 3 improvement ideas"}
      </button>

      {activePanel === "suggestions" && suggestions.length ? (
        <div
          key={suggestPass}
          className="scroll mt-3 max-h-[280px] space-y-2 overflow-y-auto rounded-lg border border-[#DFE8FF] bg-white/80 p-3 pr-2"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6573]">
            Improvement ideas
          </p>
          {suggestions.map((item, i) => (
            <div
              key={`${suggestPass}-${item}-${i}`}
              className="rounded-lg border border-[#E8EBEF] bg-white px-3 py-2.5"
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

      <div className="mt-3 flex gap-2 border-t border-[#DFE8FF] pt-3">
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

      {activePanel === "ask" && answer ? (
        <p className="mt-3 rounded-lg border border-[#DFE8FF] bg-white px-3 py-2.5 text-[12.5px] leading-relaxed text-[#3a4250]">
          {answer}
        </p>
      ) : null}
    </div>
  );
}
