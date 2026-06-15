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

  return (
    <div className="mt-5 border-t border-[#E8EBEF] pt-4">
      <div className="mb-2 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A92A0]">
        AI assist
      </div>
      <div className="flex flex-wrap gap-2">
        {section.id === "summary" ? (
          <AssistButton
            loading={loading === "improve-summary"}
            onClick={() => run("improve-summary")}
          >
            Improve summary
          </AssistButton>
        ) : null}
        {section.id === "header" ? (
          <AssistButton
            loading={loading === "improve-headline"}
            onClick={() => run("improve-headline")}
          >
            Improve headline
          </AssistButton>
        ) : null}
        {section.id === "skills" ? (
          <AssistButton
            loading={loading === "suggest-skills"}
            onClick={() => run("suggest-skills")}
          >
            Suggest skills
          </AssistButton>
        ) : null}
        {section.id === "experience" && section.index !== undefined ? (
          <AssistButton
            loading={loading === "polish-bullets"}
            onClick={() =>
              run("polish-bullets", { experienceIndex: section.index })
            }
          >
            Polish bullets
          </AssistButton>
        ) : null}
        <AssistButton
          loading={loading === "suggest"}
          onClick={() => run("suggest")}
        >
          Get suggestions
        </AssistButton>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask AI anything about this section…"
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
          className="cursor-pointer rounded-lg border-none bg-[#EAF1FF] px-3 py-2 text-[12.5px] font-semibold text-[#2456D6] disabled:opacity-50"
        >
          Ask
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-[12px] text-[#B23B3B]">{error}</p>
      ) : null}
      {answer ? (
        <p className="mt-2 rounded-lg bg-[#F7F9FC] px-3 py-2 text-[12.5px] leading-relaxed text-[#3a4250]">
          {answer}
        </p>
      ) : null}
      {suggestions.length ? (
        <ul className="mt-2 space-y-1.5 text-[12.5px] leading-relaxed text-[#3a4250]">
          {suggestions.map((item) => (
            <li key={item} className="rounded-lg bg-[#F7F9FC] px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AssistButton({
  children,
  onClick,
  loading,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="cursor-pointer rounded-lg border border-[#DFE3E8] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#2456D6] transition-colors hover:border-[#C8D8FF] hover:bg-[#F5F8FF] disabled:opacity-50"
    >
      {loading ? "Working…" : children}
    </button>
  );
}
