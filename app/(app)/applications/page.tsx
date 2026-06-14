import { ApplicationsList } from "@/components/applications/applications-list";
import { getApplicationsList } from "@/lib/applications/actions";
import { getLibraryData } from "@/lib/resume/actions";

export default async function ApplicationsPage() {
  const [{ applications }, { defaultVersionId }] = await Promise.all([
    getApplicationsList(),
    getLibraryData(),
  ]);

  return (
    <ApplicationsList
      applications={applications}
      defaultVersionId={defaultVersionId}
    />
  );
}
