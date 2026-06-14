import { NavIcon, type NavIconName } from "@/components/icons/nav-icons";
import { APPLICATION_OS_LOOP } from "@/lib/marketing/content";

export function ApplicationOsLoop() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-sidebar py-16 text-white sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(47,107,255,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(122,83,255,0.12),transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7FA6FF]">
            The application OS
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Six modules. One closed loop.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#AEB6C2]">
            Generators stop at the download. An application OS runs the full
            cycle — build, tailor, send, snapshot, and learn — so every
            application makes the next one smarter.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {APPLICATION_OS_LOOP.map((item, index) => (
            <div key={item.title} className="relative">
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:border-accent/40 hover:bg-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent/20 text-[#7FA6FF]">
                    <NavIcon name={item.icon as NavIconName} />
                  </div>
                  <span className="font-display text-xs font-bold text-[#6E7686]">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[17px] font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#AEB6C2]">
                  {item.description}
                </p>
                {index < APPLICATION_OS_LOOP.length - 1 && (
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#7FA6FF]">
                    → {item.connectsTo}
                  </p>
                )}
                {index === APPLICATION_OS_LOOP.length - 1 && (
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#0E7C4B]">
                    ↻ Feeds back into your library
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[#CDEBD9]/30 bg-[#0E7C4B]/10 px-6 py-5 text-center sm:text-left">
          <p className="text-[14px] leading-relaxed text-[#D4F0E3]">
            <span className="font-semibold text-white">The moat:</span> when
            you log an application, Resume Studio freezes the exact resume,
            cover letter, and Q&A you sent. Insights stay tied to reality — even
            as your master resume evolves.
          </p>
        </div>
      </div>
    </section>
  );
}
