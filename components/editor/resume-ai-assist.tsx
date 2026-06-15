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

export type AiUndoSnapshot = {
  headline?: string;
  summary?: string;
  skills?: string[];
  experience?: {
    index: number;
    blurb?: string;
    bullets?: string[];
  };
};

type PendingUndo = {
  label: string;
  snapshot: AiUndoSnapshot;
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
  onRestoreUndo: (snapshot: AiUndoSnapshot) => void;
};

const SECTION_COPY: Record<
  ResumeEditSection["id"],
  { tagline: string; hint: string }
> = {
  header: {
    tagline: "Sharpen your headline",
    hint: "Get positioning that reads like a VP, not a job description.",
  },
  summary: {
    tagline: "Rewrite your opener",
    hint: "Turn the summary into a tight, role-ready narrative.",
  },
  skills: {
    tagline: "Curate your skills",
    hint: "Surface the keywords recruiters actually scan for.",
  },
  experience: {
    tagline: "Polish this role",
    hint: "Quantify impact and tighten every bullet.",
  },
  activities: {
    tagline: "Polish this activity",
    hint: "Show leadership and impact in clubs, sports, and volunteering.",
  },
  education: {
    tagline: "Improve this section",
    hint: "Spot gaps and ways to strengthen your credentials.",
  },
  awards: {
    tagline: "Strengthen your honors",
    hint: "Phrase awards and recognitions so they land.",
  },
};

export function ResumeAiAssist({
  section,
  data,
  onApplySummary,
  onApplyHeadline,
  onApplySkills,
  onApplyBullets,
  onApplyPatch,
  onRestoreUndo,
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
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const isWorking = loading !== null;
  const copy = SECTION_COPY[section.id];

  function openAiPanel() {
    if (detailsRef.current) detailsRef.current.open = true;
  }

  function registerUndo(label: string, snapshot: AiUndoSnapshot) {
    setPendingUndo({ label, snapshot });
  }

  function captureSnapshotForPatch(patch: AiApplyPatch): AiUndoSnapshot {
    const snapshot: AiUndoSnapshot = {};
    if (patch.headline !== undefined) snapshot.headline = data.headline;
    if (patch.summary !== undefined) snapshot.summary = data.summary;
    if (patch.skills !== undefined) snapshot.skills = [...data.skills];

    const idx = patch.experience?.index;
    if (idx !== undefined && data.experience[idx]) {
      const role = data.experience[idx];
      snapshot.experience = { index: idx };
      if (patch.experience?.blurb !== undefined) {
        snapshot.experience.blurb = role.blurb;
      }
      if (patch.experience?.bullets) {
        snapshot.experience.bullets = [...role.bullets];
      }
    }

    return snapshot;
  }

  function handleUndo() {
    if (!pendingUndo) return;
    onRestoreUndo(pendingUndo.snapshot);
    setPendingUndo(null);
    setAppliedSuggestion(null);
  }

  const activeSectionKey = sectionKey(section);

  useEffect(() => {
    setError("");
    setAnswer("");
    setSuggestions([]);
    setHeadlineOptions([]);
    setAppliedSuggestion(null);
    setActivePanel(null);
    setSuggestPass(0);
    setPendingUndo(null);
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
        const index = opts.experienceIndex;
        const role = data.experience[index];
        const snapshot: AiUndoSnapshot = role
          ? {
              experience: {
                index,
                blurb: role.blurb,
                bullets: [...role.bullets],
              },
            }
          : {};
        onApplyBullets(index, json.blurb ?? "", json.bullets ?? []);
        registerUndo("Bullets polished", snapshot);
        setActivePanel(null);
        return true;
      }
      if (action === "suggest-skills") {
        registerUndo("Skills updated", { skills: [...data.skills] });
        onApplySkills(json.skills ?? []);
        setActivePanel(null);
        return true;
      }
      if (action === "improve-summary") {
        registerUndo("Summary updated", { summary: data.summary });
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
        const patch = (json.patch ?? {}) as AiApplyPatch;
        const snapshot = captureSnapshotForPatch(patch);
        onApplyPatch(patch);
        registerUndo("Suggestion applied", snapshot);
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
        ? { label: "Generate headline options", action: "improve-headline" as const }
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
      className="group/ai resume-ai-assist mt-8"
    >
      <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
        <div
          className={`relative overflow-hidden rounded-[14px] p-[1px] transition-shadow duration-300 group-open/ai:rounded-b-none ${
            isWorking
              ? "resume-ai-glow-active shadow-[0_0_28px_-4px_rgba(47,107,255,0.55)]"
              : "shadow-[0_0_0_1px_rgba(47,107,255,0.12),0_10px_28px_-14px_rgba(47,107,255,0.35)]"
          }`}
        >
          <div className="resume-ai-border absolute inset-0 rounded-[14px] opacity-90" />
          <div className="relative flex items-center gap-3 rounded-[13px] bg-gradient-to-br from-[#F5F8FF] via-white to-[#F8F5FF] px-3.5 py-3 group-open/ai:rounded-b-none">
            <div className="relative flex h-9 w-9 flex-none items-center justify-center">
              <span className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-[#2F6BFF] to-[#7C5CFF] opacity-15" />
              <span className="resume-ai-sparkle relative text-[17px] leading-none text-[#2F6BFF]">
                ✦
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-[13.5px] font-semibold text-ink">
                  Resume AI
                </span>
                <span className="rounded-full bg-gradient-to-r from-[#2F6BFF]/10 to-[#7C5CFF]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2456D6]">
                  Beta
                </span>
              </div>
              <p className="mt-0.5 truncate text-[12px] text-[#7A828F]">
                {copy.tagline}
              </p>
            </div>
            <span className="flex-none text-[#9AA3AF] transition-transform duration-200 group-open/ai:rotate-180">
              ▾
            </span>
          </div>
        </div>
      </summary>

      <div className="relative -mt-1 overflow-hidden rounded-b-[14px] border border-t-0 border-[#E4EAFF] bg-gradient-to-b from-[#FAFBFF] to-white px-3.5 pb-4 pt-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#7C5CFF]/8 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[#2F6BFF]/8 blur-2xl" />

        <div className="relative space-y-3.5">
          <p className="text-[12.5px] leading-relaxed text-[#5A6573]">
            {copy.hint}
          </p>

          {error ? (
            <p className="rounded-[10px] border border-[#F5C4C4] bg-[#FFF4F4] px-3 py-2 text-[12px] text-[#B23B3B]">
              {error}
            </p>
          ) : null}

          {pendingUndo ? (
            <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#C8D8FF] bg-gradient-to-r from-[#F0F5FF] to-white px-3 py-2.5">
              <span className="text-[12.5px] text-[#3a4250]">
                {pendingUndo.label}
              </span>
              <button
                type="button"
                onClick={handleUndo}
                className="cursor-pointer rounded-[8px] border border-[#C8D8FF] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#2456D6] transition-colors hover:border-[#A8C0FF] hover:bg-[#F5F8FF]"
              >
                Undo
              </button>
            </div>
          ) : null}

          {primaryAction ? (
            <button
              type="button"
              disabled={loading === primaryAction.action}
              onClick={() =>
                run(primaryAction.action, {
                  experienceIndex: primaryAction.experienceIndex,
                })
              }
              className="group/btn relative w-full cursor-pointer overflow-hidden rounded-[11px] border-none bg-gradient-to-r from-[#2F6BFF] via-[#4B5FFF] to-[#6B4FFF] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(47,107,255,0.65)] transition-[transform,box-shadow] hover:shadow-[0_8px_24px_-6px_rgba(47,107,255,0.75)] active:scale-[0.99] disabled:opacity-70"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition-opacity group-hover/btn:opacity-100" />
              <span className="relative inline-flex items-center justify-center gap-2">
                {loading === primaryAction.action ? (
                  <>
                    <LoadingDots />
                    Working magic…
                  </>
                ) : (
                  <>
                    <span className="text-[15px] leading-none">✦</span>
                    {primaryAction.label}
                  </>
                )}
              </span>
            </button>
          ) : null}

          <button
            type="button"
            disabled={loading === "suggest"}
            onClick={() => run("suggest")}
            className="w-full cursor-pointer rounded-[11px] border border-[#C8D8FF] bg-white/80 px-4 py-2.5 text-[12.5px] font-semibold text-[#2456D6] backdrop-blur-sm transition-colors hover:border-[#A8C0FF] hover:bg-[#F5F8FF] disabled:opacity-60"
          >
            {loading === "suggest" ? (
              <span className="inline-flex items-center justify-center gap-2">
                <LoadingDots />
                Finding ideas…
              </span>
            ) : suggestions.length ? (
              "Refresh improvement ideas"
            ) : (
              "Get 3 improvement ideas"
            )}
          </button>

          {activePanel === "headline" && headlineOptions.length ? (
            <ResultBlock title="Pick a headline">
              {headlineOptions.map((headline, i) => (
                <button
                  key={`${headline}-${i}`}
                  type="button"
                  onClick={() => {
                    registerUndo("Headline updated", {
                      headline: data.headline,
                    });
                    onApplyHeadline(headline);
                    setHeadlineOptions([]);
                    setActivePanel(null);
                  }}
                  className="w-full cursor-pointer rounded-[10px] border border-[#E2E8FF] bg-white px-3 py-2.5 text-left text-[12.5px] leading-snug text-ink shadow-[0_1px_2px_rgba(15,17,22,0.04)] transition-all hover:border-[#2F6BFF] hover:shadow-[0_4px_14px_-6px_rgba(47,107,255,0.35)]"
                >
                  {headline}
                </button>
              ))}
            </ResultBlock>
          ) : null}

          {activePanel === "suggestions" && suggestions.length ? (
            <ResultBlock title="Improvement ideas">
              {suggestions.map((item, i) => (
                <div
                  key={`${suggestPass}-${i}`}
                  className="relative overflow-hidden rounded-[10px] border border-[#E2E8FF] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,17,22,0.04)]"
                >
                  <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[#2F6BFF] to-[#7C5CFF]" />
                  <p className="pl-2 text-[12.5px] leading-relaxed text-[#3a4250]">
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
                    className="mt-2.5 pl-2 text-[12px] font-semibold text-[#2456D6] hover:underline disabled:opacity-50"
                  >
                    {loading === `implement-${i}`
                      ? "Applying…"
                      : appliedSuggestion === i
                        ? "Applied to resume ✓"
                        : "Apply this idea →"}
                  </button>
                </div>
              ))}
            </ResultBlock>
          ) : null}

          <div className="rounded-[11px] border border-[#E2E8FF] bg-white/90 p-1 shadow-[inset_0_1px_2px_rgba(15,17,22,0.03)]">
            <div className="flex gap-1.5">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about this section…"
                className="min-w-0 flex-1 rounded-[8px] border-none bg-transparent px-2.5 py-2 text-[13px] text-ink placeholder:text-[#9AA3AF] focus:outline-none"
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
                className="cursor-pointer rounded-[8px] bg-[#EAF1FF] px-3 py-2 text-[12px] font-semibold text-[#2456D6] transition-colors hover:bg-[#DCE8FF] disabled:opacity-50"
              >
                {loading === "ask" ? "…" : "Ask"}
              </button>
            </div>
          </div>

          {activePanel === "ask" && answer ? (
            <div className="rounded-[10px] border border-[#E2E8FF] bg-white px-3 py-2.5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#8A92A0]">
                Answer
              </p>
              <p className="text-[12.5px] leading-relaxed text-[#5A6573]">
                {answer}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </details>
  );
}

function ResultBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8A92A0]">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="resume-ai-dot h-1 w-1 rounded-full bg-current"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
