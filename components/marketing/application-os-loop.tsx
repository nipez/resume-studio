import { NavIcon, type NavIconName } from "@/components/icons/nav-icons";
import {
  GlowCard,
  LoopDiagram,
  MeshBackground,
  SectionHeader,
} from "@/components/marketing/primitives";
import { APPLICATION_OS_LOOP, SITE_NAME } from "@/lib/marketing/content";

export function ApplicationOsLoop() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-sidebar py-20 text-white sm:py-24">
      <MeshBackground dark />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(47,107,255,0.25),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-start">
          <SectionHeader
            eyebrow="The application OS"
            eyebrowVariant="dark"
            dark
            title="Six modules. One closed loop."
            description="Generators stop at the download. An application OS runs the full cycle — build, tailor, send, snapshot, and learn — so every application makes the next one smarter."
          />
          <LoopDiagram />
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPLICATION_OS_LOOP.map((item, index) => (
            <GlowCard key={item.title} dark className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-accent/20 text-[#7FA6FF] ring-1 ring-accent/30">
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
                <p className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#7FA6FF]">
                  <span aria-hidden>→</span> {item.connectsTo}
                </p>
              )}
              {index === APPLICATION_OS_LOOP.length - 1 && (
                <p className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#0E7C4B]">
                  <span aria-hidden>↻</span> Feeds back into your library
                </p>
              )}
            </GlowCard>
          ))}
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-[#CDEBD9]/30 bg-gradient-to-r from-[#0E7C4B]/15 via-[#0E7C4B]/10 to-transparent">
          <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:gap-6 sm:px-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0E7C4B]/20 text-xl text-[#0E7C4B]">
              ◈
            </div>
            <p className="text-[14px] leading-relaxed text-[#D4F0E3]">
              <span className="font-semibold text-white">The moat:</span> when
              you log an application, {SITE_NAME} freezes the exact resume,
              cover letter, and Q&A you sent. Insights stay tied to reality —
              even as your master resume evolves.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
