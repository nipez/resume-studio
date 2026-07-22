import { LibraryActions } from "@/components/library/library-actions";
import { LibraryView } from "@/components/library/library-view";
import { buildHref } from "@/components/dashboard/dashboard-shared";
import { getApplicationCountsByVersion } from "@/lib/applications/actions";
import { getUserProfileContext } from "@/lib/profile/actions";
import { resolveFirstName } from "@/lib/profile/utils";
import { getLibraryData } from "@/lib/resume/actions";
import Link from "next/link";

export default async function LibraryPage() {
  const [{ versions, archivedVersions, defaultVersionId, userName }, versionCounts, profile] =
    await Promise.all([
      getLibraryData(),
      getApplicationCountsByVersion(),
      getUserProfileContext(),
    ]);
  const hasVersions = versions.length > 0 || archivedVersions.length > 0;
  const buildLink = buildHref(profile.isStudent);
  const firstName = resolveFirstName(userName);

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1120px] px-5 pb-16 sm:px-8 lg:px-12 pt-7">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0 max-w-[640px]">
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
              {hasVersions
                ? `Hello${firstName ? `, ${firstName}` : ""}`
                : `Hello${firstName ? `, ${firstName}` : ""} — let's create your first document`}
            </h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              {hasVersions
                ? "Your resumes live here. Duplicate a cut, tailor for a role, or open the editor."
                : "Build or import a resume — then keep tailored cuts organized in one place."}
            </p>
          </div>
          <LibraryActions buildHref={buildLink} createLabel="+ Create new" />
        </div>

        {!hasVersions ? (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-dashed border-[#B8D0FF] bg-gradient-to-br from-[#F3F7FF] to-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-[16px] font-semibold text-ink">
                No documents yet
              </h2>
              <p className="mt-1.5 max-w-[480px] text-[13.5px] leading-relaxed text-muted">
                Start on Home for a guided pick, or build / import directly.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/dashboard"
                className="inline-flex rounded-[11px] border border-[#DCE0E6] bg-white px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-[#F4F5F7]"
              >
                Go to Home
              </Link>
              <Link
                href={buildLink}
                className="inline-flex rounded-[11px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-accent-dark"
              >
                Build step by step
              </Link>
            </div>
          </div>
        ) : null}

        {hasVersions ? (
          <LibraryView
            activeVersions={versions}
            archivedVersions={archivedVersions}
            defaultVersionId={defaultVersionId}
            versionCounts={versionCounts}
            isStudent={profile.isStudent}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
            <p className="text-[14px] text-muted">
              Your documents will show up here once you build or import one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
