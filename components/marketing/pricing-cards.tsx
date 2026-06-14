import Link from "next/link";
import { PRICING_PLANS } from "@/lib/marketing/content";

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
      {PRICING_PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`flex flex-col rounded-2xl border p-8 ${
            plan.highlighted
              ? "relative border-accent bg-white shadow-[0_16px_48px_rgba(47,107,255,0.14)] lg:-mt-2 lg:mb-2"
              : "border-border bg-white"
          }`}
        >
          {plan.highlighted ? (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
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
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            {plan.description}
          </p>
          <ul className="mt-6 flex-1 space-y-3">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex gap-3 text-[13.5px] leading-relaxed text-muted"
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
