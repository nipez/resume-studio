import { MarketingHomePage } from "@/components/marketing/home/marketing-home-page";
import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default function HomePage() {
  return (
    <main>
      <MarketingHomePage />
    </main>
  );
}
