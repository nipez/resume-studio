"use client";

import type { ResumeData } from "@/lib/types/resume";
import type { ResumeEditSection } from "@/lib/types/resume-editor";
import { sectionKey } from "@/lib/types/resume-editor";
import { useEffect, useRef, useState } from "react";

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
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function openAiPanel() {
    if (detailsRef.current) detailsRef.current.open = true;
  }

  useEffect(() => {
    setError("");
    setAnswer("");
    setSuggestions([]);
    setHeadlineOptions([]);
    setAppliedSuggestion(null);
    setActivePanel(null);
    setSuggestPass(0);
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
    openAiPanel();
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
    if (action === "ask") setActivePanel("ask");

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
      ? { label: "Improve summary", action: "improve-summary" as const }
      : section.id === "header"
        ? { label: "Headline options", action: "improve-headline" as const }
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
    <details
      ref={detailsRef}
      className="group mt-8 border-t border-[#EEF1F4] pt-5"
    >
      <summary className="cursor-pointer list-none font-display text-[13px] font-semibold text-[#5A6573] marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="text-accent">✦</span>
          AI help
          <span className="text-[11px] font-normal text-[#9AA3AF]">
            (optional)
          </span>
        </span>
      </summary>

      <div className="mt-4 space-y-3">
        {error ? (
          <p className="rounded-lg bg-[#FFF4F4] px-3 py-2 text-[12px] text-[#B23B3B]">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {primaryAction ? (
            <ActionChip
              disabled={loading === primaryAction.action}
              onClick={() =>
                run(primaryAction.action, {
                  experienceIndex: primaryAction.experienceIndex,
                })
              }
            >
              {loading === primaryAction.action
                ? "Working…"
                : primaryAction.label}
            </ActionChip>
          ) : null}
          <ActionChip
            disabled={loading === "suggest"}
            onClick={() => run("suggest")}
          >
            {loading === "suggest"
              ? "Working…"
              : suggestions.length
                ? "Refresh ideas"
                : "3 ideas"}
          </ActionChip>
        </div>

        {activePanel === "headline" && headlineOptions.length ? (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A92A0]">
              Pick a headline
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
                className="w-full cursor-pointer rounded-lg border border-[#E2E6EB] bg-[#FAFBFC] px-3 py-2 text-left text-[12.5px] leading-snug text-ink hover:border-accent"
              >
                {headline}
              </button>
            ))}
          </div>
        ) : null}

        {activePanel === "suggestions" && suggestions.length ? (
          <div key={suggestPass} className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8A92A0]">
              Ideas
            </p>
            {suggestions.map((item, i) => (
              <div
                key={`${suggestPass}-${i}`}
                className="rounded-lg border border-[#E2E6EB] bg-[#FAFBFC] px-3 py-2.5"
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
                  className="mt-2 cursor-pointer text-[12px] font-semibold text-accent hover:underline disabled:opacity-50"
                >
                  {loading === `implement-${i}`
                    ? "Applying…"
                    : appliedSuggestion === i
                      ? "Applied"
                      : "Apply"}
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about this section…"
            className="min-w-0 flex-1 rounded-lg border border-[#DFE3E8] px-3 py-2 text-[13px] focus:border-accent focus:outline-none"
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
            className="cursor-pointer rounded-lg border border-[#DFE3E8] bg-white px-3 py-2 text-[12px] font-semibold text-[#2456D6] disabled:opacity-50"
          >
            Ask
          </button>
        </div>

        {activePanel === "ask" && answer ? (
          <p className="text-[12.5px] leading-relaxed text-[#5A6573]">{answer}</p>
        ) : null}
      </div>
    </details>
  );
}

function ActionChip({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer rounded-lg border border-[#DFE3E8] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#2456D6] hover:border-[#C8D8FF] hover:bg-[#F5F8FF] disabled:opacity-50"
    >
      {children}
    </button>
  );
}
