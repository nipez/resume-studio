import { POSITIONING_PILLARS } from "@/lib/marketing/content";

export function PositioningSection() {
  return (
    <section className="bg-gradient-to-b from-page to-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Why Resume Studio
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Why an application OS beats another resume builder
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            The market is split between expensive ATS scanners ($50/mo),
            tracker-first tools with weekly AI pricing ($13/week), and builders
            with trial traps. Resume Studio is the honest, affordable middle:
            one workspace from first draft to interview prep.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {POSITIONING_PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="group rounded-2xl border border-border bg-white p-7 shadow-[0_8px_26px_rgba(15,17,22,0.04)] transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_12px_32px_rgba(47,107,255,0.08)]"
            >
              <span className="inline-flex rounded-full bg-[#EEF3FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                {pillar.accent}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">
                {pillar.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
