"use client";

import Link from "next/link";

type PrepFlowStepperProps = {
  currentStep: 1 | 2 | 3 | 4;
  /** Saved tailored resume version id — unlocks steps 2–4 */
  resultId?: string | null;
  className?: string;
};

const STEPS = [
  { step: 1 as const, label: "Job details" },
  { step: 2 as const, label: "Tailored resume" },
  { step: 3 as const, label: "Cover letter" },
  { step: 4 as const, label: "Log application" },
];

function stepHref(step: 1 | 2 | 3 | 4, resultId?: string | null): string | null {
  if (step === 1) return "/tailor";
  if (!resultId) return null;
  if (step === 2) return `/tailor?r=${resultId}`;
  if (step === 3) return `/cover?v=${resultId}`;
  return `/cover?v=${resultId}#log-application`;
}

export function PrepFlowStepper({
  currentStep,
  resultId,
  className = "",
}: PrepFlowStepperProps) {
  return (
    <nav
      aria-label="Application prep progress"
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      {STEPS.map(({ step, label }, index) => {
        const href = stepHref(step, resultId);
        const isActive = currentStep === step;
        const isComplete = currentStep > step;
        const isClickable = Boolean(href) && (step === 1 || resultId);

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
            <span className="text-[13px] font-semibold">{label}</span>
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
