import { LibraryActions } from "@/components/library/library-actions";
import { LibraryWelcomeEmpty } from "@/components/library/library-welcome-empty";
import { VersionCard } from "@/components/library/version-card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getApplicationCountsByVersion } from "@/lib/applications/actions";
import { getLibraryData } from "@/lib/resume/actions";

export default async function LibraryPage() {
  const [{ versions, defaultVersionId }, versionCounts, { displayName }] =
    await Promise.all([
      getLibraryData(),
      getApplicationCountsByVersion(),
      getSessionProfile(),
    ]);
  const hasVersions = versions.length > 0;

  if (!hasVersions) {
    return (
      <LibraryWelcomeEmpty displayName={displayName ?? "there"} />
    );
  }

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1120px] px-12 pb-16 pt-[42px]">
        <div className="mb-[30px] flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-[30px] font-semibold tracking-[-0.025em] text-ink">
              Resume Library
            </h1>
            <p className="mt-2 max-w-[560px] text-[14.5px] leading-relaxed text-muted">
              Keep a set of resume cuts for different roles. Duplicate one to
              riff on it, or tailor a fresh version to a specific job
              description.
            </p>
          </div>
          <LibraryActions />
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-[18px]">
          {versions.map((version) => (
            <VersionCard
              key={version.id}
              version={version}
              isDefault={version.id === defaultVersionId}
              appCount={versionCounts[version.id] ?? 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
