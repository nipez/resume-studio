import { NavIcon, type NavIconName } from "@/components/icons/nav-icons";
import { FEATURES } from "@/lib/marketing/content";

type FeatureGridProps = {
  title?: string;
  description?: string;
  limit?: number;
};

export function FeatureGrid({
  title = "Everything in one calm workspace",
  description = "No more scattered docs and half-finished drafts. Resume Studio keeps your resumes, letters, and applications organized.",
  limit,
}: FeatureGridProps) {
  const items = limit ? FEATURES.slice(0, limit) : FEATURES;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {description}
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border bg-white p-6 shadow-[0_8px_26px_rgba(15,17,22,0.04)] transition hover:border-[#CDD3DB] hover:shadow-[0_8px_26px_rgba(15,17,22,0.07)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#EEF3FF] text-accent">
              <NavIcon name={feature.icon as NavIconName} />
            </div>
            <h3 className="mt-4 font-display text-[17px] font-semibold tracking-[-0.01em] text-ink">
              {feature.title}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
