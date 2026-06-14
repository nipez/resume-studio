import Link from "next/link";
import { PRICING_PLANS } from "@/lib/marketing/content";

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      {PRICING_PLANS.map((plan) => (
        <div
          key={plan.name}
          className={`rounded-2xl border p-8 ${
            plan.highlighted
              ? "border-accent bg-white shadow-[0_8px_26px_rgba(47,107,255,0.12)]"
              : "border-border bg-page"
          }`}
        >
          {plan.highlighted ? (
            <span className="inline-flex rounded-full bg-[#EEF3FF] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent">
              Beta
            </span>
          ) : null}
          <h3 className="mt-4 font-display text-2xl font-semibold text-ink">
            {plan.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-ink">
              {plan.price}
            </span>
            {plan.period ? (
              <span className="text-sm text-muted">{plan.period}</span>
            ) : null}
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            {plan.description}
          </p>
          <ul className="mt-6 space-y-3">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-[14px] leading-relaxed text-muted"
              >
                <span className="text-accent">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className={`mt-8 inline-flex w-full justify-center rounded-[11px] px-5 py-3 text-[14px] font-semibold transition ${
              plan.highlighted
                ? "bg-accent text-white shadow-accent hover:bg-accent-dark"
                : "border border-border bg-white text-ink hover:border-accent hover:text-accent"
            }`}
          >
            {plan.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
