import { FRAGMENTED_STACK } from "@/lib/marketing/content";

export function FragmentedStack() {
  return (
    <section className="border-b border-border bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#B23B3B]">
              The problem
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Job search shouldn&apos;t require a five-tool stack
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Most seekers stitch together a resume builder, ATS scanner,
              tracker, Google Doc, and an AI generator — then lose track of
              which version went where. That&apos;s not a workflow. That&apos;s
              duct tape.
            </p>
            <div className="mt-8 rounded-2xl border border-accent/20 bg-[#F8FAFF] p-6">
              <p className="font-display text-lg font-semibold text-ink">
                Resume Studio replaces the stack.
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                One application OS with six integrated modules, subscription
                pricing from $2.99/mo, and snapshots that keep your history
                honest.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {FRAGMENTED_STACK.map((item) => (
              <div
                key={item.tool}
                className="flex flex-col gap-2 rounded-2xl border border-border bg-page px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-display text-[15px] font-semibold text-ink">
                    {item.tool}
                  </div>
                  <div className="mt-1 text-[13px] text-muted">
                    {item.problem}
                  </div>
                </div>
                <div className="flex-none text-[12px] font-bold uppercase tracking-wider text-[#B23B3B] sm:text-right">
                  {item.cost}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
