import { NavIcon, type NavIconName } from "@/components/icons/nav-icons";
import { GlowCard, SectionHeader } from "@/components/marketing/primitives";
import { FEATURES, SITE_NAME } from "@/lib/marketing/content";

type FeatureGridProps = {
  title?: string;
  description?: string;
  limit?: number;
};

export function FeatureGrid({
  title = "Everything in one calm workspace",
  description = `No more scattered docs and half-finished drafts. ${SITE_NAME} keeps your resumes, letters, and applications organized.`,
  limit,
}: FeatureGridProps) {
  const items = limit ? FEATURES.slice(0, limit) : FEATURES;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <SectionHeader title={title} description={description} />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((feature, i) => (
          <GlowCard
            key={feature.title}
            className={`p-6 ${i === 2 ? "lg:-mt-4" : i === 4 ? "lg:mt-4" : ""}`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#EEF3FF] to-white text-accent ring-1 ring-accent/15">
              <NavIcon name={feature.icon as NavIconName} />
            </div>
            <h3 className="mt-4 font-display text-[17px] font-semibold tracking-[-0.01em] text-ink">
              {feature.title}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              {feature.description}
            </p>
          </GlowCard>
        ))}
      </div>
    </section>
  );
}
