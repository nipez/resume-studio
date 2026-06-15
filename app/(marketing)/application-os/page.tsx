import { ApplicationOsLoop } from "@/components/marketing/application-os-loop";
import { FragmentedStack } from "@/components/marketing/fragmented-stack";
import { GeneratorVsOs } from "@/components/marketing/generator-vs-os";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { MeshBackground } from "@/components/marketing/primitives";
import { PositioningSection } from "@/components/marketing/positioning-section";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Application OS — ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
};

const PHASES = [
  {
    title: "Build",
    icon: "◆",
    body: "Resume library with multiple cuts, templates, and a default starting point. Your master stays clean while tailored versions branch off.",
  },
  {
    title: "Send",
    icon: "→",
    body: "Tailor, cover letter, and Q&A from the same context — then log the application with everything snapshotted exactly as submitted.",
  },
  {
    title: "Learn",
    icon: "◎",
    body: "Insights tied to real sends: which versions get interviews, where you stall, and what to fix next. Data that compounds over months.",
  },
];

export default function ApplicationOsPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-[#152238] to-[#0a0c10]" />
        <MeshBackground dark />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7FA6FF]">
            <span className="h-px w-6 bg-[#7FA6FF]/50" aria-hidden />
            The application OS
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Generators give you a PDF.
            <br />
            <span className="bg-gradient-to-r from-[#7FA6FF] to-[#B89DFF] bg-clip-text text-transparent">
              An application OS runs your search.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#AEB6C2]">
            {SITE_NAME} connects resume versions, job-specific tailoring,
            cover letters, application Q&A, tracking, and insights in one
            closed loop — with immutable snapshots of every send.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-[11px] bg-accent px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(47,107,255,0.45)] transition hover:bg-accent-dark"
            >
              Start free during beta
            </Link>
            <Link
              href="/features"
              className="rounded-[11px] border border-white/15 bg-white/5 px-6 py-3.5 text-[14px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Explore features
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {PHASES.map((phase, i) => (
              <div
                key={phase.title}
                className={`relative overflow-hidden rounded-2xl border border-border bg-page p-7 transition hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_14px_36px_rgba(47,107,255,0.08)] ${i === 1 ? "lg:-mt-4" : ""}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent font-display text-lg font-bold text-white shadow-accent">
                  {phase.icon}
                </div>
                <div className="mt-4 font-display text-sm font-bold uppercase tracking-wider text-accent">
                  {phase.title}
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-muted">
                  {phase.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ApplicationOsLoop />
      <FragmentedStack />
      <GeneratorVsOs />
      <PositioningSection />
      <MarketingCta
        title="Your search deserves a system"
        description="Free during beta. Subscription pricing from $2.99/mo — not credit packs that disappear."
      />
    </main>
  );
}
