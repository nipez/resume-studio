import { STUDENT_USE_CASES } from "@/lib/marketing/content";

const ICONS: Record<(typeof STUDENT_USE_CASES)[number]["icon"], string> = {
  spark: "✦",
  briefcase: "◆",
  graduation: "◎",
  sun: "☀",
};

export function StudentUseCases() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Built for real student situations
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Whether you&apos;re staring at a blank page or sending your fifth
          application this week — these are the scenarios we designed for.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {STUDENT_USE_CASES.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-white p-7 shadow-[0_8px_26px_rgba(15,17,22,0.04)]"
          >
            <div className="flex items-start gap-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FF] text-lg text-accent"
                aria-hidden
              >
                {ICONS[item.icon]}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                  {item.scenario}
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink">
                  <span className="font-semibold text-accent">Outcome: </span>
                  {item.outcome}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
