import { ApplicationDetailView } from "@/components/applications/application-detail-view";
import {
  getApplication,
  getCompanyApplicationHistory,
} from "@/lib/applications/actions";
import { getLibraryData } from "@/lib/resume/actions";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const application = await getApplication(id);

    if (!application) {
      notFound();
    }

    const [{ versions }, companyHistory] = await Promise.all([
      getLibraryData(),
      getCompanyApplicationHistory(application.company, application.id),
    ]);

    return (
      <ApplicationDetailView
        application={application}
        resumeVersions={versions}
        companyHistory={companyHistory}
      />
    );
  } catch (error) {
    console.error("ApplicationDetailPage:", error);
    throw error;
  }
}
