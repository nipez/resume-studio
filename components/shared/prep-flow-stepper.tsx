"use client";

import Link from "next/link";

export type PrepFlowStep = 1 | 2 | 3 | 4 | 5;

type PrepFlowStepperProps = {
  currentStep: PrepFlowStep;
  /** Saved tailored resume version id — unlocks steps 2–5 */
  resultId?: string | null;
  /** Preserves saved-job context across prep links */
  savedJobId?: string | null;
  className?: string;
};

const STEPS = [
  { step: 1 as const, label: "Job details" },
  { step: 2 as const, label: "Tailored resume" },
  { step: 3 as const, label: "Cover letter" },
  { step: 4 as const, label: "Application Q&A" },
  { step: 5 as const, label: "Log application" },
];

function withJob(path: string, resultId: string, savedJobId?: string | null) {
  const params = new URLSearchParams({ v: resultId });
  if (savedJobId) params.set("job", savedJobId);
  return `${path}?${params.toString()}`;
}

function stepHref(
  step: PrepFlowStep,
  resultId?: string | null,
  savedJobId?: string | null
): string | null {
  if (step === 1) {
    return savedJobId ? `/tailor?job=${encodeURIComponent(savedJobId)}` : "/tailor";
  }
  if (!resultId) return null;
  if (step === 2) {
    const params = new URLSearchParams({ r: resultId });
    if (savedJobId) params.set("job", savedJobId);
    return `/tailor?${params.toString()}`;
  }
  if (step === 3) return withJob("/cover", resultId, savedJobId);
  if (step === 4) return withJob("/questions", resultId, savedJobId);
  return `${withJob("/questions", resultId, savedJobId)}#log-application`;
}

export function PrepFlowStepper({
  currentStep,
  resultId,
  savedJobId = null,
  className = "",
}: PrepFlowStepperProps) {
  return (
    <nav
      aria-label="Application prep progress"
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      {STEPS.map(({ step, label }, index) => {
        const href = stepHref(step, resultId, savedJobId);
        const isActive = currentStep === step;
        const isComplete = currentStep > step;
        const isClickable = Boolean(href) && (step === 1 || resultId);
        const optional = step === 3;

        const pillClass = isActive
          ? "border-accent bg-[#EEF3FF] text-[#1E54E6]"
          : isComplete
            ? "border-[#B8E6C8] bg-[#F0FBF4] text-[#1B5E36]"
            : "border-[#E4E7EC] bg-[#FAFBFC] text-[#9AA3AF]";

        const content = (
          <>
            <span
              className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold ${
                isActive
                  ? "bg-accent text-white"
                  : isComplete
                    ? "bg-[#2E9B5B] text-white"
                    : "bg-[#E4E7EC] text-[#8A92A0]"
              }`}
            >
              {isComplete ? "✓" : step}
            </span>
            <span className="text-[13px] font-semibold">
              {label}
              {optional ? (
                <span className="font-medium text-[#9AA3AF]"> · optional</span>
              ) : null}
            </span>
          </>
        );

        return (
          <div key={step} className="flex items-center gap-2">
            {index > 0 ? (
              <span className="hidden text-[#D2D7DE] sm:inline" aria-hidden>
                →
              </span>
            ) : null}
            {isClickable && href ? (
              <Link
                href={href}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors hover:border-[#C8CED6] ${pillClass}`}
                aria-current={isActive ? "step" : undefined}
              >
                {content}
              </Link>
            ) : (
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${pillClass}`}
                aria-current={isActive ? "step" : undefined}
              >
                {content}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
