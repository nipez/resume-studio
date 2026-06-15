import { ResumeEditor } from "@/components/editor/resume-editor";
import { getApplicationsForVersion } from "@/lib/applications/actions";
import { getResumeVersion } from "@/lib/resume/actions";
import { notFound } from "next/navigation";

type EditorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  const [version, linkedApplications] = await Promise.all([
    getResumeVersion(id),
    getApplicationsForVersion(id),
  ]);

  if (!version) notFound();

  return (
    <ResumeEditor version={version} linkedApplications={linkedApplications} />
  );
}
