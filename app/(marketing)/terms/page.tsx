import { TermsPage } from "@/components/marketing/legal/terms-page";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Terms of Service — ${SITE_NAME}`,
  description: `The rules for using ${SITE_NAME} and the application workspace.`,
};

export default function TermsRoute() {
  return (
    <main>
      <TermsPage />
    </main>
  );
}
