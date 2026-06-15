import { PricingPage } from "@/components/marketing/pricing/pricing-page";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Pricing — ${SITE_NAME}`,
  description:
    "Subscription pricing for the application OS — not credit packs. Student $2.99/mo. Essentials $4.99/mo. Pro $12/mo. Free during beta.",
};

export default function PricingRoute() {
  return (
    <main>
      <PricingPage />
    </main>
  );
}
