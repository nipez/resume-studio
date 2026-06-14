import { BETA_BANNER, PRICING_PLANS } from "@/lib/marketing/content";
import Link from "next/link";

export function StudentPricingCta() {
  const plan = PRICING_PLANS.find((p) => p.id === "student")!;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="relative overflow-hidden rounded-2xl border border-[#F59E0B]/20 bg-gradient-to-br from-[#FFF4E6] via-white to-[#EEF3FF] shadow-[0_16px_48px_rgba(245,158,11,0.1)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#F59E0B]/10 blur-3xl" />
        <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex rounded-full border border-[#F59E0B]/25 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
              {plan.badge}
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Student plan — {plan.price}
              {plan.period}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              {plan.description}
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-[#EEF3FF] px-3 py-2 text-[13px] font-semibold text-accent">
              {BETA_BANNER}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 shadow-[0_8px_26px_rgba(15,17,22,0.04)]">
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[14px] text-ink"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[11px] font-bold text-[#D97706]">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 inline-flex w-full justify-center rounded-[11px] bg-accent px-4 py-3.5 text-[14px] font-semibold text-white shadow-accent transition hover:bg-accent-dark"
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
