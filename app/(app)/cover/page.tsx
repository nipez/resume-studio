import { CoverPanel } from "@/components/cover/cover-panel";
import { VersionJobDraftBootstrap } from "@/components/cover/version-job-draft-bootstrap";
import { JobDraftBootstrap } from "@/components/saved-jobs/job-draft-bootstrap";
import { listCoverLetters } from "@/lib/cover/actions";
import { getCoverPrepSeedForVersion } from "@/lib/cover/prep-seed";
import { getLibraryData } from "@/lib/resume/actions";

type PageProps = {
  searchParams: Promise<{ v?: string; job?: string }>;
};

export default async function CoverPage({ searchParams }: PageProps) {
  const { v, job } = await searchParams;
  const [{ versions, defaultVersionId }, savedLetters] = await Promise.all([
    getLibraryData(),
    listCoverLetters(),
  ]);
  const initialVersionId =
    v && versions.some((version) => version.id === v) ? v : null;
  const coverPrepSeed = initialVersionId
    ? await getCoverPrepSeedForVersion(initialVersionId)
    : null;

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1180px] px-11 pb-16 pt-10">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Cover Letter
        </h1>
        <p className="mt-2 max-w-[640px] text-[14.5px] text-muted">
          Step 3 of 4: generate your cover letter, then log the application so
          it appears in your tracker with the resume and letter you sent.
        </p>
        <div className="mt-[26px]">
          <JobDraftBootstrap savedJobId={job ?? null} />
          {initialVersionId ? (
            <VersionJobDraftBootstrap
              versionId={initialVersionId}
              seed={coverPrepSeed}
            />
          ) : null}
          <CoverPanel
            versions={versions}
            defaultVersionId={defaultVersionId}
            savedLetters={savedLetters}
            initialVersionId={initialVersionId}
            prepFlowResultId={initialVersionId}
            savedJobId={job ?? null}
          />
        </div>
      </div>
    </div>
  );
}
