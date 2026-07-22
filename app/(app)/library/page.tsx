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
    <div className="scroll flex-1 overflow-auto bg-page">
      <div className="mx-auto max-w-[1120px] px-5 pb-20 pt-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0 max-w-[640px]">
            <h1 className="font-display text-[30px] font-semibold tracking-[-0.03em] text-ink">
              {hasVersions
                ? `Hello${firstName ? `, ${firstName}` : ""}`
                : `Hello${firstName ? `, ${firstName}` : ""} — let's create your first document`}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {hasVersions
                ? "It's nice to see you here. Duplicate a cut, tailor for a role, or open the editor."
                : "Build or import a resume — then keep tailored cuts organized in one place."}
            </p>
          </div>
          <LibraryActions buildHref={buildLink} createLabel="+ Create new" />
        </div>

        {!hasVersions ? (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-dashed border-[#9DE4DB] bg-[#F3FBFA] px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-ink">No documents yet</h2>
              <p className="mt-1.5 max-w-[480px] text-[14px] leading-relaxed text-muted">
                Start on Dashboard for a guided pick, or build / import directly.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/dashboard"
                className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-soft"
              >
                Go to Dashboard
              </Link>
              <Link
                href={buildLink}
                className="inline-flex rounded-xl bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-accent-dark"
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
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <p className="text-[14px] text-muted">
              Your documents will show up here once you build or import one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
