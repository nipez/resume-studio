import { QuoteMark, SectionHeader } from "@/components/marketing/primitives";
import { TESTIMONIALS } from "@/lib/marketing/content";

function Initials({ name }: { name: string }) {
  const parts = name.split(" ");
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : name.slice(0, 2);
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#7A53FF] font-display text-sm font-bold text-white">
      {initials.toUpperCase()}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative bg-gradient-to-b from-white via-page to-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Testimonials"
          align="center"
          title="Built for real job searches"
          description="Early beta feedback from professionals, parents, and career switchers."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <blockquote
              key={item.name}
              className={`relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-[0_8px_26px_rgba(15,17,22,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(47,107,255,0.08)] ${i === 1 ? "md:-mt-4" : ""}`}
            >
              <QuoteMark />
              <p className="-mt-4 flex-1 text-[14px] leading-relaxed text-ink">
                {item.quote}
              </p>
              <footer className="mt-6 flex items-center gap-3 border-t border-border pt-5">
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
