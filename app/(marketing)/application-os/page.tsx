import { ApplicationOsPage } from "@/components/marketing/application-os/application-os-page";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Application OS — ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
};

export default function Page() {
  return (
    <main>
      <ApplicationOsPage />
    </main>
  );
}
