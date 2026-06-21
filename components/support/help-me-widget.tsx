"use client";

import { Toast } from "@/components/ui/toast";
import { SupportComposeForm } from "@/components/support/support-compose-form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type HelpMeWidgetProps = {
  isStudent?: boolean;
};

export function HelpMeWidget({ isStudent = false }: HelpMeWidgetProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (pathname === "/messages") return null;

  function handleClose() {
    setOpen(false);
  }

  function handleSuccess() {
    setOpen(false);
    setToast("Message sent — we'll reply here in Help & support");
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
              <SupportComposeForm isStudent={isStudent} onSuccess={handleSuccess} />
            </div>

            <div className="border-t border-[#EEF0F3] px-5 py-3.5">
              <Link
                href="/messages"
                onClick={handleClose}
                className="text-[12.5px] font-semibold text-accent hover:underline"
              >
                View Help & support inbox
              </Link>
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
