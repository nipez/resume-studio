import { GlowCard } from "@/components/marketing/primitives";
import { STUDENT_COVER_LETTER_SCENARIOS } from "@/lib/marketing/content";

export function StudentCoverLetters() {
  return (
    <section className="border-y border-border bg-gradient-to-b from-white to-[#FFFBF5]">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D97706]">
            Cover letters
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            First cover letters that don&apos;t sound fake
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Part-time jobs and internships often want a short letter — not a
            three-paragraph essay. The Student plan includes AI drafts tuned for
            entry-level roles.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {STUDENT_COVER_LETTER_SCENARIOS.map((item, i) => (
            <GlowCard
              key={item.role}
              className={`border-[#F59E0B]/10 bg-white p-6 ${i === 1 ? "sm:mt-6" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-sm font-bold text-[#D97706]">
                  ✉
                </span>
                <div>
                  <h3 className="font-display text-[17px] font-semibold text-ink">
                    {item.role}
                  </h3>
                  <p className="mt-1 text-[13px] font-medium text-accent">
                    {item.example}
                  </p>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                    {item.tip}
                  </p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
