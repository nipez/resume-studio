import { FeaturesPage } from "@/components/marketing/features/features-page";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Features — ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
};

export default function Page() {
  return (
    <main>
      <FeaturesPage />
    </main>
  );
}
