import { TESTIMONIALS } from "@/lib/marketing/content";

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Built for real job searches
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-muted">
            Early beta feedback from professionals, parents, and career
            switchers.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <blockquote
              key={item.name}
              className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-[0_8px_26px_rgba(15,17,22,0.04)]"
            >
              <p className="flex-1 text-[14px] leading-relaxed text-ink">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-5 border-t border-border pt-4">
                <div className="font-display text-[14px] font-semibold text-ink">
                  {item.name}
                </div>
                <div className="mt-0.5 text-[12px] text-muted">{item.role}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
