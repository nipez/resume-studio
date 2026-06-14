import { ApplicationDetailView } from "@/components/applications/application-detail-view";
import { getApplication } from "@/lib/applications/actions";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  return <ApplicationDetailView application={application} />;
}
