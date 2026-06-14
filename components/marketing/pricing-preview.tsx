import Link from "next/link";
import { PRICING_PLANS } from "@/lib/marketing/content";

export function PricingPreview() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Pricing that won&apos;t punish your job search
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              Subscription access to the application OS — not credit packs.
              Student from $2.99. Full workspace without AI for $4.99.
            </p>
          </div>
          <Link
            href="/pricing"
            className="text-[14px] font-semibold text-accent hover:text-accent-dark"
          >
            Full pricing details →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-7 ${
                plan.highlighted
                  ? "border-accent bg-white shadow-[0_12px_40px_rgba(47,107,255,0.12)]"
                  : "border-border bg-white"
              }`}
            >
              <span className="inline-flex rounded-full bg-page px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
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
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
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
