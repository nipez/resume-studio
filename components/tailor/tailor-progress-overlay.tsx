"use client";

import { Spinner } from "@/components/ui/spinner";
import { useEffect, useMemo, useState } from "react";

type TailorProgressOverlayProps = {
  open: boolean;
  depth: "light" | "deep";
  phase: "tailoring" | "saving";
  jobRole?: string;
  jobCompany?: string;
};

const LIGHT_STEPS = [
  "Reading the job description",
  "Tailoring summary and skills",
  "Highlighting your most relevant roles",
  "Putting the final touches on your resume",
];

const DEEP_STEPS = [
  "Reading the job description",
  "Tailoring summary and skills",
  "Rewriting bullets for every role",
  "Deep tailoring takes a bit longer — still working",
  "Putting the final touches on your resume",
];

export function TailorProgressOverlay({
  open,
  depth,
  phase,
  jobRole,
  jobCompany,
}: TailorProgressOverlayProps) {
  const steps = depth === "deep" ? DEEP_STEPS : LIGHT_STEPS;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || phase === "saving") return;
    const intervalMs = depth === "deep" ? 5000 : 3000;
    const id = window.setInterval(() => {
      setStepIndex((current) => Math.min(current + 1, steps.length - 1));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [open, phase, depth, steps.length]);

  useEffect(() => {
    if (!open) setStepIndex(0);
  }, [open]);

  const progress = useMemo(() => {
    if (phase === "saving") return 94;
    const total = steps.length + 1;
    return Math.min(88, Math.round(((stepIndex + 1) / total) * 88));
  }, [phase, stepIndex, steps.length]);

  if (!open) return null;

  const statusLabel =
    phase === "saving" ? "Saving to your library…" : steps[stepIndex];

  const targetLabel =
    jobRole && jobCompany
      ? `${jobRole} at ${jobCompany}`
      : jobRole || jobCompany || "this role";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(15,17,22,0.48)] px-6 backdrop-blur-[3px]"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tailor-progress-title"
        className="w-full max-w-[440px] rounded-2xl border border-[#E6E8EC] bg-white px-7 py-7 shadow-[0_24px_64px_rgba(15,17,22,0.22)]"
      >
        <div className="flex items-center gap-3">
          <Spinner className="h-5 w-5 border-accent/30 border-t-accent" />
          <div>
            <h2
              id="tailor-progress-title"
              className="font-display text-[18px] font-semibold tracking-[-0.02em] text-ink"
            >
              {phase === "saving" ? "Saving to your library" : "Tailoring your resume"}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {phase === "saving" ? "Almost done" : `For ${targetLabel}`}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-3 text-[12.5px]">
            <span className="font-semibold text-[#3A4350]">{statusLabel}</span>
            <span className="tabular-nums text-[#8A92A0]">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#EEF0F3]">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="mt-4 text-[12.5px] leading-[1.5] text-[#8A92A0]">
          {phase === "saving"
            ? "Your tailored resume will appear as soon as it’s saved."
            : depth === "deep"
              ? "Deep tailoring rewrites every role — this can take up to a minute."
              : "Usually takes 15–30 seconds. Please keep this tab open."}
        </p>
      </div>
    </div>
  );
}
