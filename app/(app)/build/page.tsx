import { GuidedBuilder, type GuidedMode } from "@/components/guided/guided-builder";
import { getGuidedDraft } from "@/lib/guided/actions";
import { getStudentSegment } from "@/lib/profile/actions";
import { getLibraryData } from "@/lib/resume/actions";

export default async function BuildPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const [draft, library, segment] = await Promise.all([
    getGuidedDraft(),
    getLibraryData(),
    getStudentSegment(),
  ]);

  // Explicit ?mode wins; otherwise remember the user's saved student segment.
  const initialMode: GuidedMode =
    searchParams.mode === "student"
      ? "student"
      : searchParams.mode === "standard"
        ? "standard"
        : segment.isStudent
          ? "student"
          : "standard";

  return (
    <GuidedBuilder
      initialDraft={draft}
      userName={library.userName ?? ""}
      userEmail={library.userEmail ?? ""}
      initialMode={initialMode}
      initialStudentLevel={segment.studentLevel}
    />
  );
}
