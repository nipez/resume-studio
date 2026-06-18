import { LibraryActions } from "@/components/library/library-actions";
import { LibraryView } from "@/components/library/library-view";
import { buildHref } from "@/components/dashboard/dashboard-shared";
import { getApplicationCountsByVersion } from "@/lib/applications/actions";
import { getStudentSegment } from "@/lib/profile/actions";
import { getLibraryData } from "@/lib/resume/actions";
import Link from "next/link";

export default async function LibraryPage() {
  const [{ versions, archivedVersions, defaultVersionId }, versionCounts, segment] =
    await Promise.all([
      getLibraryData(),
      getApplicationCountsByVersion(),
      getStudentSegment(),
    ]);
  const hasVersions = versions.length > 0 || archivedVersions.length > 0;
  const buildLink = buildHref(segment.isStudent);

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
          <LibraryActions buildHref={buildLink} />
        </div>

        {!hasVersions ? (
          <div className="mb-[22px] rounded-2xl border border-[#E4E7EC] bg-[#FAFBFC] px-6 py-6">
            <h2 className="font-display text-[16.5px] font-semibold text-ink">
              No resume yet
            </h2>
            <p className="mt-1.5 max-w-[520px] text-[13.5px] leading-relaxed text-muted">
              Start on Home for a guided pick (student, experienced, or import),
              or use the buttons above to build or import directly.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link
                href="/dashboard"
                className="inline-flex rounded-[11px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1E54E6]"
              >
                Go to Home →
              </Link>
              <Link
                href={buildLink}
                className="inline-flex rounded-[11px] border border-[#DCE0E6] bg-white px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-[#F4F5F7]"
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
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
            <p className="text-[14px] text-muted">
              Your resumes will show up here once you build or import one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
