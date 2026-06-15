import { GlowCard, SectionHeader } from "@/components/marketing/primitives";
import { POSITIONING_PILLARS, SITE_NAME } from "@/lib/marketing/content";

export function PositioningSection() {
  return (
    <section className="relative bg-gradient-to-b from-page via-white to-page py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,rgba(47,107,255,0.04),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow={`Why ${SITE_NAME}`}
          title="Why an application OS beats another resume builder"
          description={`The market is split between expensive ATS scanners ($50/mo), tracker-first tools with weekly AI pricing ($13/week), and builders with trial traps. ${SITE_NAME} is the honest, affordable middle: one workspace from first draft to interview prep.`}
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {POSITIONING_PILLARS.map((pillar, i) => (
            <GlowCard
              key={pillar.title}
              className={`p-7 ${i === 1 ? "md:mt-8" : ""}`}
            >
              <span className="inline-flex rounded-full bg-[#EEF3FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent ring-1 ring-accent/10">
                {pillar.accent}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">
                {pillar.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {pillar.description}
              </p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
