import { GuidedBuilder, type GuidedMode } from "@/components/guided/guided-builder";
import { getGuidedDraft } from "@/lib/guided/actions";
import { getLibraryData } from "@/lib/resume/actions";

export default async function BuildPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const [draft, library] = await Promise.all([
    getGuidedDraft(),
    getLibraryData(),
  ]);

  const initialMode: GuidedMode =
    searchParams.mode === "student" ? "student" : "standard";

  return (
    <GuidedBuilder
      initialDraft={draft}
      userName={library.userName ?? ""}
      userEmail={library.userEmail ?? ""}
      initialMode={initialMode}
    />
  );
}
