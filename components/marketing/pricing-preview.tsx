import { SectionHeader } from "@/components/marketing/primitives";
import Link from "next/link";
import { PRICING_PLANS } from "@/lib/marketing/content";

export function PricingPreview() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(47,107,255,0.06),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            eyebrow="Pricing"
            title="Pricing that won't punish your job search"
            description="Subscription access to the application OS — not credit packs. Student from $2.99. Full workspace without AI for $4.99."
          />
          <Link
            href="/pricing"
            className="shrink-0 rounded-lg border border-border bg-white px-4 py-2 text-[14px] font-semibold text-accent shadow-sm transition hover:border-accent/30 hover:shadow-[0_4px_16px_rgba(47,107,255,0.1)]"
          >
            Full pricing details →
          </Link>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, i) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-7 transition ${
                plan.highlighted
                  ? "z-10 border-accent bg-white shadow-[0_16px_48px_rgba(47,107,255,0.14)] lg:-mt-3 lg:mb-3"
                  : "border-border bg-white hover:border-accent/20 hover:shadow-[0_12px_32px_rgba(15,17,22,0.06)]"
              } ${i === 0 ? "lg:mt-3" : ""}`}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-accent">
                  Most popular
                </span>
              ) : null}
              <span className="inline-flex w-fit rounded-full bg-page px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                {plan.badge}
              </span>
              <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
                {plan.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold text-ink">
                  {plan.price}
                </span>
                <span className="text-sm text-muted">{plan.period}</span>
              </div>
              <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-muted">
                {plan.description}
              </p>
              <Link
                href="/login"
                className={`mt-6 inline-flex w-full justify-center rounded-[11px] px-4 py-3 text-[13.5px] font-semibold transition ${
                  plan.highlighted
                    ? "bg-accent text-white shadow-accent hover:bg-accent-dark"
                    : "border border-border text-ink hover:border-accent hover:text-accent"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
