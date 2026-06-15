import { ApplicationsList } from "@/components/applications/applications-list";
import { getApplicationsList } from "@/lib/applications/actions";
import { getLibraryData } from "@/lib/resume/actions";

export default async function ApplicationsPage() {
  const [{ applications }, { defaultVersionId, versions }] = await Promise.all([
    getApplicationsList(),
    getLibraryData(),
  ]);

  const defaultVersion = versions.find((version) => version.id === defaultVersionId);

  return (
    <ApplicationsList
      applications={applications}
      defaultVersionId={defaultVersionId}
      defaultVersionName={defaultVersion?.name ?? null}
      defaultVersionRole={defaultVersion?.tailored_for?.role ?? ""}
      defaultVersionCompany={defaultVersion?.tailored_for?.company ?? ""}
    />
  );
}
