import { ResumeEditor } from "@/components/editor/resume-editor";
import { getResumeVersion } from "@/lib/resume/actions";
import { notFound } from "next/navigation";

type EditorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  const version = await getResumeVersion(id);

  if (!version) notFound();

  return <ResumeEditor version={version} />;
}
