import { HERO_STATS } from "@/lib/marketing/content";

export function StatsBar() {
  return (
    <section className="relative border-b border-white/10 bg-sidebar">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(47,107,255,0.12),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-px bg-white/10 px-6 sm:grid-cols-4">
        {HERO_STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`bg-sidebar px-4 py-10 text-center sm:py-12 sm:text-left ${i > 0 ? "sm:border-l sm:border-white/10" : ""}`}
          >
            <div className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              <span className="bg-gradient-to-r from-[#7FA6FF] to-[#B89DFF] bg-clip-text text-transparent">
                {stat.value}
              </span>
            </div>
            <div className="mt-2 text-[13px] font-medium text-[#AEB6C2]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
