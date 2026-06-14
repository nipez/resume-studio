import { STUDENT_COVER_LETTER_SCENARIOS } from "@/lib/marketing/content";

export function StudentCoverLetters() {
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            First cover letters that don&apos;t sound fake
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Part-time jobs and internships often want a short letter — not a
            three-paragraph essay. The Student plan includes AI drafts tuned for
            entry-level roles.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {STUDENT_COVER_LETTER_SCENARIOS.map((item) => (
            <div
              key={item.role}
              className="rounded-2xl border border-border bg-page p-6"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
