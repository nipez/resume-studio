import { GuidedBuilder } from "@/components/guided/guided-builder";
import { getGuidedDraft } from "@/lib/guided/actions";
import { getLibraryData } from "@/lib/resume/actions";

export default async function BuildPage() {
  const [draft, library] = await Promise.all([
    getGuidedDraft(),
    getLibraryData(),
  ]);

  return (
    <GuidedBuilder
      initialDraft={draft}
      userName={library.userName ?? ""}
      userEmail={library.userEmail ?? ""}
    />
  );
}
