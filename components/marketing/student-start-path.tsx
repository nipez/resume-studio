import { STUDENT_START_STEPS } from "@/lib/marketing/content";
import Link from "next/link";

export function StudentStartPath() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-page to-[#FFFBF5]">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D97706]">
            <span className="mr-2 inline-block h-px w-6 bg-[#F59E0B]/40 align-middle" />
            Getting started
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Where to start
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Five steps from blank page to resume and cover letter — no
            guesswork, no pretending you have ten years of experience.
          </p>
        </div>

        <div className="relative mt-12">
          <div
            className="absolute left-5 top-0 hidden h-full w-px bg-gradient-to-b from-[#F59E0B]/40 via-[#F59E0B]/20 to-transparent sm:block"
            aria-hidden
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {STUDENT_START_STEPS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-[#F59E0B]/15 bg-white p-6 shadow-[0_8px_26px_rgba(245,158,11,0.06)] transition hover:-translate-y-0.5 hover:border-[#F59E0B]/30 hover:shadow-[0_14px_36px_rgba(245,158,11,0.1)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FEF3C7] to-[#FFFBEB] font-display text-sm font-bold text-[#D97706] ring-2 ring-white">
                  {item.step.replace("0", "")}
                </div>
                <h3 className="mt-4 font-display text-[16px] font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 rounded-2xl border border-[#F59E0B]/15 bg-white/80 p-6 backdrop-blur-sm">
          <Link
            href="/login"
            className="inline-flex rounded-[11px] bg-accent px-6 py-3 text-[14px] font-semibold text-white shadow-accent transition hover:bg-accent-dark"
          >
            Start guided builder →
          </Link>
          <p className="text-[13px] text-muted">
            Guided builder launching soon · free during beta
          </p>
        </div>
      </div>
    </section>
  );
}
