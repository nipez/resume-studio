import { ApplicationsList } from "@/components/applications/applications-list";
import { getApplicationsList } from "@/lib/applications/actions";
import { getSavedJobsList } from "@/lib/saved-jobs/actions";
import { getUserProfileContext } from "@/lib/profile/actions";
import { getLibraryData } from "@/lib/resume/actions";

export default async function ApplicationsPage() {
  const [{ applications, archivedApplications }, savedJobs, { defaultVersionId, versions }, profile] =
    await Promise.all([
      getApplicationsList(),
      getSavedJobsList(),
      getLibraryData(),
      getUserProfileContext(),
    ]);

  const defaultVersion = versions.find((version) => version.id === defaultVersionId);

  return (
    <ApplicationsList
      applications={applications}
      archivedApplications={archivedApplications}
      savedJobs={savedJobs}
      defaultVersionId={defaultVersionId}
      defaultVersionName={defaultVersion?.name ?? null}
      defaultVersionRole={defaultVersion?.tailored_for?.role ?? ""}
      defaultVersionCompany={defaultVersion?.tailored_for?.company ?? ""}
      isStudent={profile.isStudent}
    />
  );
}
