import { CoverPanel } from "@/components/cover/cover-panel";
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
      <div className="mx-auto max-w-[1180px] px-5 pb-16 sm:px-8 lg:px-11 pt-10">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Cover Letter
        </h1>
        <p className="mt-2 max-w-[640px] text-[14.5px] text-muted">
          Step 3 of 5 (optional): generate a cover letter if you need one, then
          continue to Application Q&amp;A for portal questions before you log.
        </p>
        <div className="mt-[26px]">
          <JobDraftBootstrap savedJobId={job ?? null} />
          <CoverPanel
            versions={versions}
            defaultVersionId={defaultVersionId}
            savedLetters={savedLetters}
            initialVersionId={initialVersionId}
            prepFlowResultId={initialVersionId}
            savedJobId={job ?? null}
            prepSeed={coverPrepSeed}
          />
        </div>
      </div>
    </div>
  );
}
