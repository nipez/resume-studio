import { GlowCard } from "@/components/marketing/primitives";
import { FRAGMENTED_STACK, SITE_NAME } from "@/lib/marketing/content";

export function FragmentedStack() {
  return (
    <section className="border-b border-border bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#B23B3B]">
              <span className="h-px w-6 bg-[#B23B3B]/40" aria-hidden />
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
            <GlowCard
              className="mt-8 border-accent/20 bg-gradient-to-br from-[#F8FAFF] to-white p-7"
              hover={false}
            >
              <p className="font-display text-lg font-semibold text-ink">
                {SITE_NAME} replaces the stack.
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                One application OS with six integrated modules, subscription
                pricing from $2.99/mo, and snapshots that keep your history
                honest.
              </p>
            </GlowCard>
          </div>

          <div className="relative">
            <div
              className="absolute -left-4 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-[#B23B3B]/40 via-border to-transparent lg:block"
              aria-hidden
            />
            <div className="flex flex-col gap-3">
              {FRAGMENTED_STACK.map((item, i) => (
                <div
                  key={item.tool}
                  className="group flex flex-col gap-2 rounded-2xl border border-border bg-page px-5 py-4 transition hover:border-[#B23B3B]/30 hover:bg-white hover:shadow-[0_8px_24px_rgba(178,59,59,0.06)] sm:flex-row sm:items-center sm:justify-between"
                  style={{ marginLeft: i % 2 === 1 ? "1.5rem" : "0" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[12px] font-bold text-[#B23B3B] shadow-sm ring-1 ring-border">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-display text-[15px] font-semibold text-ink">
                        {item.tool}
                      </div>
                      <div className="mt-0.5 text-[13px] text-muted">
                        {item.problem}
                      </div>
                    </div>
                  </div>
                  <div className="flex-none pl-11 text-[12px] font-bold uppercase tracking-wider text-[#B23B3B] sm:pl-0 sm:text-right">
                    {item.cost}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
