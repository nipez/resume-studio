import { AboutPage } from "@/components/marketing/about/about-page";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `About — ${SITE_NAME}`,
  description: `${SITE_NAME} is built by a team with 40+ years of combined experience reviewing resumes and cover letters, coaching interviews, and placing people into jobs.`,
};

export default function Page() {
  return (
    <main>
      <AboutPage />
    </main>
  );
}
