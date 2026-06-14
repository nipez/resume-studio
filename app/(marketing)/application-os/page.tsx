import { ApplicationOsLoop } from "@/components/marketing/application-os-loop";
import { FragmentedStack } from "@/components/marketing/fragmented-stack";
import { GeneratorVsOs } from "@/components/marketing/generator-vs-os";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { PositioningSection } from "@/components/marketing/positioning-section";
import { SITE_DESCRIPTION } from "@/lib/marketing/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Application OS — Resume Studio",
  description: SITE_DESCRIPTION,
};

export default function ApplicationOsPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-[#152238] to-[#0a0c10]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(47,107,255,0.3),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7FA6FF]">
            The application OS
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            Generators give you a PDF.
            <br />
            An application OS runs your search.
          </h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#AEB6C2]">
            Resume Studio connects resume versions, job-specific tailoring,
            cover letters, application Q&A, tracking, and insights in one
            closed loop — with immutable snapshots of every send.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-[11px] bg-accent px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(47,107,255,0.45)] transition hover:bg-accent-dark"
            >
              Start free during beta
            </Link>
            <Link
              href="/features"
              className="rounded-[11px] border border-white/15 bg-white/5 px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-white/10"
            >
              Explore features
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            {[
              {
                title: "Build",
                body: "Resume library with multiple cuts, templates, and a default starting point. Your master stays clean while tailored versions branch off.",
              },
              {
                title: "Send",
                body: "Tailor, cover letter, and Q&A from the same context — then log the application with everything snapshotted exactly as submitted.",
              },
              {
                title: "Learn",
                body: "Insights tied to real sends: which versions get interviews, where you stall, and what to fix next. Data that compounds over months.",
              },
            ].map((phase) => (
              <div
                key={phase.title}
                className="rounded-2xl border border-border bg-page p-7"
              >
                <div className="font-display text-sm font-bold uppercase tracking-wider text-accent">
                  {phase.title}
                </div>
                <p className="mt-4 text-[14px] leading-relaxed text-muted">
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
