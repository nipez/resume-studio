"use client";

import { ImportModal } from "@/components/import/import-modal";
import { NavIcon } from "@/components/icons/nav-icons";
import { createResumeVersion } from "@/lib/resume/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const START_PATHS = [
  {
    id: "guided",
    title: "Build step by step",
    description:
      "Answer a few short questions. We draft your resume as you go — best if you're starting fresh or want a clean rewrite.",
    href: "/build?mode=student",
    cta: "Start guided build",
    recommended: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3v18" />
        <path d="M5 8h4l3-5 3 5h4" />
        <path d="M7 21h10" />
      </svg>
    ),
  },
  {
    id: "import",
    title: "Import what you have",
    description:
      "Upload a PDF or paste text from an existing resume. Edit and tailor it here instead of starting over.",
    action: "import" as const,
    cta: "Import resume",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3v12" />
        <path d="M8 7l4-4 4 4" />
        <path d="M4 21h16" />
      </svg>
    ),
  },
  {
    id: "blank",
    title: "Start from a blank page",
    description:
      "Jump straight into the editor with an empty resume. Full control — add sections and content yourself.",
    action: "blank" as const,
    cta: "Open blank editor",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6" />
        <path d="M9 13h4" />
      </svg>
    ),
  },
] as const;

const LOOP_STEPS = [
  { label: "Library", icon: "library" as const },
  { label: "Tailor", icon: "target" as const },
  { label: "Cover", icon: "mail" as const },
  { label: "Q&A", icon: "chat" as const },
  { label: "Track", icon: "briefcase" as const },
  { label: "Insights", icon: "chart" as const },
];

type LibraryWelcomeEmptyProps = {
  displayName: string;
};

export function LibraryWelcomeEmpty({ displayName }: LibraryWelcomeEmptyProps) {
  const router = useRouter();
  const [importOpen, setImportOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleBlankStart() {
    startTransition(async () => {
      const version = await createResumeVersion();
      router.push(`/editor/${version.id}`);
    });
  }

  return (
    <>
      <div className="scroll flex-1 overflow-auto">
        <div className="mx-auto max-w-[960px] px-6 pb-16 pt-8 sm:px-10 sm:pt-10 lg:px-12">
          <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0D0F14] via-[#152238] to-[#1E3A8A] px-6 py-10 text-white shadow-[0_24px_60px_-20px_rgba(15,17,22,0.45)] sm:px-10 sm:py-12">
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#2F6BFF]/30 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-[#7A53FF]/25 blur-3xl"
              aria-hidden
            />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#9FC0FF]">
                  Welcome to your workspace
                </p>
                <h1 className="mt-3 font-display text-[clamp(28px,5vw,38px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                  Hey {displayName} — let&apos;s get your first resume in the library.
                </h1>
                <p className="mt-4 text-[15px] leading-relaxed text-[#AEB6C2]">
                  ResumeTrakr isn&apos;t just a PDF generator. It&apos;s an application OS:
                  build versions here, tailor to jobs, track sends, and learn what works.
                </p>
              </div>

              <div
                className="relative mx-auto w-full max-w-[280px] shrink-0 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm lg:mx-0"
                aria-hidden
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B6B]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FFD166]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#06D6A0]" />
                </div>
                <div className="rounded-xl bg-white p-4 shadow-lg">
                  <div className="font-display text-[15px] font-bold text-accent">
                    Your Name
                  </div>
                  <div className="mt-1 h-2 w-3/4 rounded bg-[#E6E8EC]" />
                  <div className="mt-4 space-y-2">
                    <div className="h-1.5 w-full rounded bg-[#EEF3FF]" />
                    <div className="h-1.5 w-[92%] rounded bg-[#EEF3FF]" />
                    <div className="h-1.5 w-[78%] rounded bg-[#EEF3FF]" />
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#EEF3FF] px-2.5 py-2">
                    <span className="text-[10px] font-bold text-accent">✓</span>
                    <span className="text-[10px] font-medium text-[#1E54E6]">
                      Snapshot saved on send
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8">
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.02em] text-ink">
              Pick how you want to start
            </h2>
            <p className="mt-1.5 text-[14px] text-muted">
              You can always import later or duplicate versions once you have one.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {START_PATHS.map((path) => {
              const cardInner = (
                <>
                  {path.recommended ? (
                    <span className="absolute right-4 top-4 rounded-full bg-[#EEF3FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#1E54E6]">
                      Recommended
                    </span>
                  ) : null}
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3FF] text-accent">
                    {path.icon}
                  </div>
                  <h3 className="mt-4 font-display text-[16px] font-semibold tracking-[-0.01em] text-ink">
                    {path.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-muted">
                    {path.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-[13.5px] font-semibold text-accent group-hover:gap-2 transition-[gap]">
                    {path.cta}
                    <span aria-hidden>→</span>
                  </span>
                </>
              );

              if ("href" in path && path.href) {
                return (
                  <Link
                    key={path.id}
                    href={path.href}
                    className="group relative flex flex-col rounded-2xl border border-border bg-white p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[#CDD3DB] hover:shadow-[0_12px_32px_rgba(15,17,22,0.08)]"
                  >
                    {cardInner}
                  </Link>
                );
              }

              return (
                <button
                  key={path.id}
                  type="button"
                  disabled={pending && path.action === "blank"}
                  onClick={() => {
                    if (path.action === "import") setImportOpen(true);
                    else if (path.action === "blank") handleBlankStart();
                  }}
                  className="group relative flex flex-col rounded-2xl border border-border bg-white p-5 text-left transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[#CDD3DB] hover:shadow-[0_12px_32px_rgba(15,17,22,0.08)] disabled:opacity-60"
                >
                  {cardInner}
                </button>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-white px-5 py-5 sm:px-6">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-muted">
              Once your resume is in the library
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
              {LOOP_STEPS.map((step, index) => (
                <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E6E8EC] bg-[#F8F9FB] px-3 py-1.5">
                    <span className="flex h-4 w-4 items-center justify-center text-accent">
                      <NavIcon name={step.icon} />
                    </span>
                    <span className="text-[12.5px] font-semibold text-ink">
                      {step.label}
                    </span>
                  </div>
                  {index < LOOP_STEPS.length - 1 ? (
                    <span className="hidden text-[#C5CAD3] sm:inline" aria-hidden>
                      →
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-muted">
              Six modules, one login — tailor, cover letters, Q&amp;A, application
              tracking, and insights all connect back to what you actually sent.
            </p>
          </div>
        </div>
      </div>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
