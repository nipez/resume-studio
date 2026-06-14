import { MarketingHomePage } from "@/components/marketing/home/marketing-home-page";
import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: `${SITE_NAME} — The application OS for job search`,
  description: SITE_DESCRIPTION,
};

export default function HomePage() {
  return (
    <main>
      <MarketingHomePage />
    </main>
  );
}
