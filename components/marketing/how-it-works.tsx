import { HOW_IT_WORKS } from "@/lib/marketing/content";

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            How it works
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            A calm, step-by-step flow from blank page to tracked applications.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-border bg-page p-6"
            >
              <div className="font-display text-sm font-bold text-accent">
                {item.step}
              </div>
              <h3 className="mt-3 font-display text-[17px] font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
