"use client";

import {
  formatBannedPhrasesInput,
  updateSystemGuidelines,
} from "@/lib/admin/guidelines-actions";
import type { SystemGuidelines } from "@/lib/ai/system-guidelines";
import { Toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminGuidelinesTabProps = {
  guidelines: SystemGuidelines;
};

export function AdminGuidelinesTab({ guidelines }: AdminGuidelinesTabProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rules, setRules] = useState(guidelines.guidelines);
  const [bannedPhrasesText, setBannedPhrasesText] = useState(
    formatBannedPhrasesInput(guidelines.bannedPhrases)
  );
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function handleSave() {
    setError("");
    startTransition(async () => {
      try {
        await updateSystemGuidelines({ guidelines: rules, bannedPhrasesText });
        setToast("AI guidelines saved — all new generations will follow these rules");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save guidelines");
      }
    });
  }

  const phraseCount = bannedPhrasesText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-[#CFE0FF] bg-[#EAF1FF] px-5 py-4 text-[13.5px] leading-relaxed text-[#2b3140]">
        <div className="font-display text-[14px] font-semibold text-[#1E54E6]">
          AI voice guardrails
        </div>
        <p className="mt-1.5">
          These rules apply to every AI generation across the product: resume
          tailoring, cover letters, interview prep, and editor assist. Use them
          to block telltale AI phrases and enforce writing style.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-white px-6 py-5">
        <h3 className="font-display text-[15px] font-semibold text-ink">
          Writing rules
        </h3>
        <p className="mt-1.5 max-w-[720px] text-[13px] leading-relaxed text-muted">
          Freeform instructions the model must follow. Examples: don&apos;t use
          em dashes, avoid buzzwords, keep bullets under 2 lines.
        </p>
        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          rows={5}
          placeholder="Do not use em dashes or hyphens as punctuation in generated prose..."
          className="mt-4 w-full resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 text-[13.5px] leading-relaxed text-ink focus:border-accent focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-border bg-white px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-[15px] font-semibold text-ink">
            Banned phrases
          </h3>
          <span className="text-[12px] font-semibold text-muted">
            {phraseCount} phrase{phraseCount === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mt-1.5 max-w-[720px] text-[13px] leading-relaxed text-muted">
          One phrase per line. The model is told to never use these words or close
          variants — helpful for blocking obvious AI tells like &ldquo;it
          lands&rdquo; or &ldquo;In today&apos;s rapidly evolving.&rdquo;
        </p>
        <textarea
          value={bannedPhrasesText}
          onChange={(e) => setBannedPhrasesText(e.target.value)}
          rows={8}
          placeholder={"it lands\nhere's the part most people miss\nIn today's rapidly evolving"}
          className="mt-4 w-full resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 font-mono text-[13px] leading-relaxed text-ink focus:border-accent focus:outline-none"
        />
      </div>

      {error ? (
        <p className="text-[13px] font-semibold text-[#B23B3B]">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={handleSave}
          className="cursor-pointer rounded-[10px] border-none bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save guidelines"}
        </button>
        {guidelines.updatedAt ? (
          <span className="text-[12.5px] text-muted">
            Last saved{" "}
            {new Date(guidelines.updatedAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        ) : null}
      </div>

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
