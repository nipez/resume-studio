import { GlowCard } from "@/components/marketing/primitives";
import { STUDENT_USE_CASES } from "@/lib/marketing/content";

const ICONS: Record<(typeof STUDENT_USE_CASES)[number]["icon"], string> = {
  spark: "✦",
  briefcase: "◆",
  graduation: "◎",
  sun: "☀",
};

const ICON_BG: Record<(typeof STUDENT_USE_CASES)[number]["icon"], string> = {
  spark: "from-[#FEF3C7] to-[#FFFBEB]",
  briefcase: "from-[#EEF3FF] to-white",
  graduation: "from-[#E0F2FE] to-white",
  sun: "from-[#FFF7ED] to-[#FFFBEB]",
};

export function StudentUseCases() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D97706]">
          Use cases
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Built for real student situations
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Whether you&apos;re staring at a blank page or sending your fifth
          application this week — these are the scenarios we designed for.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {STUDENT_USE_CASES.map((item, i) => (
          <GlowCard
            key={item.title}
            className={`border-[#F59E0B]/10 bg-gradient-to-br from-white to-[#FFFBF5] p-7 ${i === 2 ? "sm:col-span-2 sm:max-w-[calc(50%-0.625rem)]" : ""}`}
          >
            <div className="flex items-start gap-4">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${ICON_BG[item.icon]} text-lg text-[#D97706] ring-1 ring-[#F59E0B]/15`}
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
                <p className="mt-3 rounded-lg border border-[#F59E0B]/15 bg-[#FFFBF5] px-3 py-2 text-[13.5px] leading-relaxed text-ink">
                  <span className="font-semibold text-[#D97706]">Outcome: </span>
                  {item.outcome}
                </p>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
    </section>
  );
}
