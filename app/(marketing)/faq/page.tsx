import { FaqPage } from "@/components/marketing/faq/faq-page";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `FAQ — ${SITE_NAME}`,
  description:
    `What is an application OS? How ${SITE_NAME} differs from AI generators, Teal, and Jobscan. Snapshots, pricing, and honest AI.`,
};

export default function FaqRoute() {
  return (
    <main>
      <FaqPage />
    </main>
  );
}
