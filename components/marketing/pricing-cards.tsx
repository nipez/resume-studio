import Link from "next/link";
import { PRICING_PLANS } from "@/lib/marketing/content";

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
      {PRICING_PLANS.map((plan, i) => (
        <div
          key={plan.id}
          className={`relative flex flex-col rounded-2xl border p-8 transition ${
            plan.highlighted
              ? "z-10 border-accent bg-white shadow-[0_20px_56px_rgba(47,107,255,0.16)] lg:-mt-4 lg:mb-4"
              : "border-border bg-white hover:border-accent/20 hover:shadow-[0_12px_36px_rgba(15,17,22,0.08)]"
          } ${i === 0 ? "lg:mt-4" : ""}`}
        >
          {plan.highlighted ? (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-accent">
              Best value
            </span>
          ) : null}
          <span className="inline-flex w-fit rounded-full bg-page px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted ring-1 ring-border">
            {plan.badge}
          </span>
          <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
            {plan.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-5xl font-semibold tracking-tight text-ink">
              {plan.price}
            </span>
            <span className="text-sm text-muted">{plan.period}</span>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            {plan.description}
          </p>
          <ul className="mt-6 flex-1 space-y-3 border-t border-border pt-6">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-[13.5px] leading-relaxed text-muted"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEF3FF] text-[11px] font-bold text-accent">
                  ✓
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className={`mt-8 inline-flex w-full justify-center rounded-[11px] px-5 py-3.5 text-[14px] font-semibold transition ${
              plan.highlighted
                ? "bg-accent text-white shadow-accent hover:bg-accent-dark hover:shadow-[0_6px_24px_rgba(47,107,255,0.4)]"
                : "border border-border bg-page text-ink hover:border-accent hover:text-accent"
            }`}
          >
            {plan.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
