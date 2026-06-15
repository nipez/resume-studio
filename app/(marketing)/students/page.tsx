import { StudentsPage } from "@/components/marketing/students/students-page";
import { SITE_NAME } from "@/lib/marketing/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Students — First Resume & Cover Letter Builder | ${SITE_NAME}`,
  description:
    "High school and college students: build your first resume from clubs, sports, volunteering, and honors. Three templates, guided builder, cover letters for part-time jobs and internships. $2.99/mo — free during beta.",
  openGraph: {
    title: `Students — ${SITE_NAME}`,
    description:
      "Your first resume shouldn't start with a blank page. Guided builder, student templates, and cover letters for part-time jobs and internships.",
  },
};

export default function StudentsRoute() {
  return (
    <main>
      <StudentsPage />
    </main>
  );
}
