import { HERO_STATS } from "@/lib/marketing/content";

export function StatsBar() {
  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
        {HERO_STATS.map((stat) => (
          <div key={stat.label} className="text-center sm:text-left">
            <div className="font-display text-3xl font-semibold tracking-tight text-accent">
              {stat.value}
            </div>
            <div className="mt-1 text-[13px] font-medium text-muted">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
