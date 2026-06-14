import Link from "next/link";

export function MarketingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-[#1b2740] to-sidebar" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(47,107,255,0.28),transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#AEB6C2]">
              AI-assisted job applications
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl lg:text-[3.4rem]">
              Resumes that fit the role. Applications you can track.
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-[#AEB6C2] sm:text-[17px]">
              Build resume versions, tailor them to job descriptions, write cover
              letters, and track every application — with snapshots of what you
              actually sent.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-[11px] bg-accent px-5 py-3 text-[14px] font-semibold text-white shadow-accent transition hover:bg-accent-dark"
              >
                Get started free
              </Link>
              <Link
                href="/features"
                className="rounded-[11px] border border-white/15 bg-white/5 px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-white/10"
              >
                See features
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="overflow-hidden rounded-xl border border-border bg-page shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
                <div className="flex h-11 items-center gap-2 border-b border-border bg-white px-4">
                  <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                  <div className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
                  <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                  <span className="ml-2 text-xs font-medium text-muted">
                    Resume Studio
                  </span>
                </div>
                <div className="flex min-h-[280px]">
                  <div className="w-[88px] flex-none bg-sidebar p-3">
                    <div className="mb-4 h-7 w-7 rounded-lg bg-gradient-to-br from-accent to-[#7A53FF]" />
                    <div className="space-y-2">
                      <div className="h-6 rounded-md bg-accent/20" />
                      <div className="h-6 rounded-md bg-white/5" />
                      <div className="h-6 rounded-md bg-white/5" />
                      <div className="h-6 rounded-md bg-white/5" />
                    </div>
                  </div>
                  <div className="flex-1 bg-page p-4">
                    <div className="h-5 w-32 rounded bg-[#E6E8EC]" />
                    <div className="mt-3 h-3 w-full rounded bg-[#EEF0F3]" />
                    <div className="mt-2 h-3 w-4/5 rounded bg-[#EEF0F3]" />
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="h-24 rounded-xl border border-border bg-white" />
                      <div className="h-24 rounded-xl border border-border bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
