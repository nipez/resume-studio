import { SectionHeader } from "@/components/marketing/primitives";
import { HOW_IT_WORKS } from "@/lib/marketing/content";

export function HowItWorks() {
  return (
    <section className="relative border-y border-border bg-page">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <SectionHeader
          eyebrow="Workflow"
          title="How it works"
          description="A calm, step-by-step flow from blank page to tracked applications."
        />

        <div className="relative mt-14">
          <div
            className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent lg:block"
            aria-hidden
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-border bg-white p-6 shadow-[0_8px_26px_rgba(15,17,22,0.04)] transition hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_14px_36px_rgba(47,107,255,0.08)]"
              >
                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display text-sm font-bold text-white shadow-accent">
                  {item.step.replace("0", "")}
                </div>
                <h3 className="mt-4 font-display text-[17px] font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
