import { LegalPageLayout } from "@/components/marketing/legal/legal-page-layout";
import { LEGAL_LAST_UPDATED, PRIVACY_SECTIONS } from "@/lib/marketing/legal";
import { SITE_NAME } from "@/lib/marketing/content";

export function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle={`How ${SITE_NAME} collects, uses, and protects your information.`}
      updated={LEGAL_LAST_UPDATED}
      sections={PRIVACY_SECTIONS}
    />
  );
}
