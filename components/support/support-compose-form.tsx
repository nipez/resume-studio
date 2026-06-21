"use client";

import { Spinner } from "@/components/ui/spinner";
import { createSupportTicket } from "@/lib/support/actions";
import { SUPPORT_CATEGORIES } from "@/lib/support/constants";
import type { SupportCategory } from "@/lib/support/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SupportComposeFormProps = {
  isStudent?: boolean;
  onSuccess?: () => void;
  className?: string;
  submitLabel?: string;
};

export function SupportComposeForm({
  isStudent = false,
  onSuccess,
  className = "",
  submitLabel = "Send message",
}: SupportComposeFormProps) {
  const router = useRouter();
  const [category, setCategory] = useState<SupportCategory>("question");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      try {
        await createSupportTicket({ category, message });
        setMessage("");
        setCategory("question");
        router.refresh();
        onSuccess?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {SUPPORT_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
              category === item.id
                ? "border-accent/35 bg-[#F5F8FF]"
                : "border-[#EEF0F3] bg-white hover:border-[#D9DEE5]"
            }`}
          >
            <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[#EEF3FF] text-[14px] font-bold text-accent">
              {item.icon}
            </span>
            <span>
              <span className="block text-[13.5px] font-semibold text-ink">
                {item.label}
              </span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted">
                {item.description}
              </span>
            </span>
          </button>
        ))}
      </div>

      {category === "human_review" ? (
        <p className="mt-3 rounded-lg border border-[#E8ECF1] bg-[#FAFBFC] px-3 py-2.5 text-[12px] leading-relaxed text-muted">
          Paid live consults are coming soon. For now, tell us what role you&apos;re
          targeting and we&apos;ll follow up with options.
        </p>
      ) : null}

      <label className="mt-4 flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
        Your message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder={
            category === "feature"
              ? "I'd love it if ResumeTrakr could…"
              : category === "human_review"
                ? "I'm applying for… and would like feedback on…"
                : isStudent
                  ? "I'm stuck on…"
                  : "I'm stuck on…"
          }
          className="resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </label>

      {error ? (
        <p className="mt-2 text-[13px] font-semibold text-[#B23B3B]">{error}</p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-60"
        >
          {pending ? <Spinner /> : null}
          {pending ? "Sending…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
