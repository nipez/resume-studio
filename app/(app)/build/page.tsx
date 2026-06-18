import { GuidedBuilder, type GuidedMode } from "@/components/guided/guided-builder";
import { getGuidedDraft } from "@/lib/guided/actions";
import { getUserProfileContext } from "@/lib/profile/actions";
import { getLibraryData } from "@/lib/resume/actions";

export default async function BuildPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const [draft, library, profile] = await Promise.all([
    getGuidedDraft(),
    getLibraryData(),
    getUserProfileContext(),
  ]);

  const initialMode: GuidedMode =
    searchParams.mode === "student"
      ? "student"
      : searchParams.mode === "standard"
        ? "standard"
        : profile.isStudent
          ? "student"
          : "standard";

  return (
    <GuidedBuilder
      initialDraft={draft}
      userName={library.userName ?? ""}
      userEmail={library.userEmail ?? ""}
      initialMode={initialMode}
      initialStudentLevel={profile.studentLevel}
    />
  );
}
