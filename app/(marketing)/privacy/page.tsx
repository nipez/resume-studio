import { PrivacyPage } from "@/components/marketing/legal/privacy-page";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE_NAME}`,
  description: `How ${SITE_NAME} collects, uses, and protects your information.`,
};

export default function PrivacyRoute() {
  return (
    <main>
      <PrivacyPage />
    </main>
  );
}
