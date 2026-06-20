"use client";

import { Toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { createSupportTicket } from "@/lib/support/actions";
import { SUPPORT_CATEGORIES } from "@/lib/support/constants";
import type { SupportCategory } from "@/lib/support/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type HelpMeWidgetProps = {
  isStudent?: boolean;
};

export function HelpMeWidget({ isStudent = false }: HelpMeWidgetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<SupportCategory>("question");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClose() {
    if (pending) return;
    setOpen(false);
    setError("");
  }

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      try {
        await createSupportTicket({ category, message });
        setMessage("");
        setOpen(false);
        setToast("Message sent — we'll reply in your inbox");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-[190] bg-[rgba(13,15,20,0.35)] backdrop-blur-[2px]"
          onClick={handleClose}
          aria-hidden
        />
      ) : null}

      <div className="fixed bottom-24 right-6 z-[200] flex flex-col items-end gap-2">
        {open ? (
          <div
            className="w-[min(400px,calc(100vw-3rem))] animate-[fadeUp_0.2s_ease_both] overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_20px_60px_rgba(15,17,22,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[#EEF0F3] px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-[18px] font-semibold text-ink">
                    How can we help?
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    {isStudent
                      ? "Ask a question, suggest a feature, or request a human resume review."
                      : "Ask a question or tell us what to build next."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[#F2F3F5] text-[#5a6573] hover:bg-[#E6E8EC]"
                  aria-label="Close help panel"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="max-h-[min(420px,60vh)] overflow-auto px-5 py-4">
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
                  Paid live consults are coming soon. For now, tell us what role
                  you&apos;re targeting and we&apos;ll follow up with options.
                </p>
              ) : null}

              <label className="mt-4 flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
                Your message
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder={
                    category === "feature"
                      ? "I'd love it if ResumeTrakr could…"
                      : category === "human_review"
                        ? "I'm applying for… and would like feedback on…"
                        : "I'm stuck on…"
                  }
                  className="resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                />
              </label>

              {error ? (
                <p className="mt-2 text-[13px] font-semibold text-[#B23B3B]">{error}</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-[#EEF0F3] px-5 py-3.5">
              <Link
                href="/messages"
                onClick={handleClose}
                className="text-[12.5px] font-semibold text-accent hover:underline"
              >
                View inbox
              </Link>
              <button
                type="button"
                disabled={pending}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-60"
              >
                {pending ? <Spinner /> : null}
                {pending ? "Sending…" : "Send message"}
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer rounded-full border border-[#E4E7EC] bg-white px-4 py-2.5 text-[13px] font-bold text-ink shadow-[0_8px_24px_rgba(15,17,22,0.12)] transition-colors hover:border-accent/30 hover:text-accent"
          aria-expanded={open}
        >
          {open ? "Close" : "Help me"}
        </button>
      </div>

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </>
  );
}
