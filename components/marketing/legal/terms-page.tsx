import { LegalPageLayout } from "@/components/marketing/legal/legal-page-layout";
import { LEGAL_LAST_UPDATED, TERMS_SECTIONS } from "@/lib/marketing/legal";
import { SITE_NAME } from "@/lib/marketing/content";

export function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      subtitle={`The rules for using ${SITE_NAME} and the application workspace.`}
      updated={LEGAL_LAST_UPDATED}
      sections={TERMS_SECTIONS}
    />
  );
}
