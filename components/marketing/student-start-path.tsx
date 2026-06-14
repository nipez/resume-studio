import { STUDENT_START_STEPS } from "@/lib/marketing/content";
import Link from "next/link";

export function StudentStartPath() {
  return (
    <section className="border-b border-border bg-page">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Where to start
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Five steps from blank page to resume and cover letter — no
            guesswork, no pretending you have ten years of experience.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {STUDENT_START_STEPS.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-border bg-white p-6 shadow-[0_8px_26px_rgba(15,17,22,0.04)]"
            >
              <div className="font-display text-sm font-bold text-accent">
                {item.step}
              </div>
              <h3 className="mt-3 font-display text-[16px] font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
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
