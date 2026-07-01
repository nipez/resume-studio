import { ApplicationDetailView } from "@/components/applications/application-detail-view";
import {
  getApplication,
  getCompanyApplicationHistory,
} from "@/lib/applications/actions";
import { listCoverLetters } from "@/lib/cover/actions";
import { getUserProfileContext } from "@/lib/profile/actions";
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

    const [{ versions }, companyHistory, savedCoverLetters, profile] = await Promise.all([
      getLibraryData(),
      getCompanyApplicationHistory(application.company, application.id),
      listCoverLetters(),
      getUserProfileContext(),
    ]);

    return (
      <ApplicationDetailView
        application={application}
        resumeVersions={versions}
        savedCoverLetters={savedCoverLetters}
        companyHistory={companyHistory}
        isStudent={profile.isStudent}
      />
    );
  } catch (error) {
    console.error("ApplicationDetailPage:", error);
    throw error;
  }
}
