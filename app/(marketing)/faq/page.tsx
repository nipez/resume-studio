import { FaqList } from "@/components/marketing/faq-list";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Resume Studio",
  description:
    "What is an application OS? How Resume Studio differs from AI generators, Teal, and Jobscan. Snapshots, pricing, and honest AI.",
};

export default function FaqPage() {
  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
            Straight answers about the application OS, snapshots, honest AI, and
            how we differ from credit-based generators.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <FaqList />
      </section>

      <MarketingCta
        title="Still have questions?"
        description="The best way to learn is to try it. Sign in free and explore the workspace."
      />
    </main>
  );
}
