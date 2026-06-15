import { FaqList } from "@/components/marketing/faq-list";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { MeshBackground } from "@/components/marketing/primitives";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `FAQ — ${SITE_NAME}`,
  description:
    `What is an application OS? How ${SITE_NAME} differs from AI generators, Teal, and Jobscan. Snapshots, pricing, and honest AI.`,
};

export default function FaqPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-[#EEF3FF] via-white to-page" />
        <MeshBackground />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            FAQ
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">
            Straight answers about the application OS, snapshots, honest AI, and
            how we differ from credit-based generators.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <FaqList />
      </section>

      <MarketingCta
        title="Still have questions?"
        description="The best way to learn is to try it. Sign in free and explore the workspace."
      />
    </main>
  );
}
