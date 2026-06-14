import { BETA_BANNER, PRICING_PLANS } from "@/lib/marketing/content";
import Link from "next/link";

export function StudentPricingCta() {
  const plan = PRICING_PLANS.find((p) => p.id === "student")!;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-[#EEF3FF] via-white to-white shadow-[0_12px_40px_rgba(47,107,255,0.08)]">
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
              {plan.badge}
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
              Student plan — {plan.price}
              {plan.period}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {plan.description}
            </p>
            <p className="mt-2 text-[13px] font-semibold text-accent">
              {BETA_BANNER}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-[14px] text-ink"
                >
                  <span className="mt-0.5 text-accent" aria-hidden>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 inline-flex w-full justify-center rounded-[11px] bg-accent px-4 py-3 text-[14px] font-semibold text-white shadow-accent transition hover:bg-accent-dark"
            >
              {plan.cta}
            </Link>
            <Link
              href="/pricing"
              className="mt-3 block text-center text-[13px] font-semibold text-accent hover:text-accent-dark"
            >
              Compare all plans →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
