import { QuoteMark } from "@/components/marketing/primitives";
import { STUDENT_TESTIMONIALS } from "@/lib/marketing/content";

function Initials({ name }: { name: string }) {
  const parts = name.split(" ");
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.slice(0, 2);
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] font-display text-sm font-bold text-white">
      {initials.toUpperCase()}
    </div>
  );
}

export function StudentTestimonials() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-[#FFFBF5] to-page">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D97706]">
            Real stories
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            From sticky notes to real resumes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-muted">
            Early feedback from students, recent grads, and parents who needed
            a first resume fast.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {STUDENT_TESTIMONIALS.map((item, i) => (
            <blockquote
              key={item.name}
              className={`relative flex flex-col rounded-2xl border border-[#F59E0B]/15 bg-white p-6 shadow-[0_8px_26px_rgba(245,158,11,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(245,158,11,0.1)] ${i === 1 ? "md:-mt-4" : ""}`}
            >
              <QuoteMark />
              <p className="-mt-4 flex-1 text-[14px] leading-relaxed text-ink">
                {item.quote}
              </p>
              <footer className="mt-6 flex items-center gap-3 border-t border-[#F59E0B]/10 pt-5">
                <Initials name={item.name} />
                <div>
                  <div className="font-display text-[14px] font-semibold text-ink">
                    {item.name}
                  </div>
                  <div className="mt-0.5 text-[12px] text-muted">{item.role}</div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
