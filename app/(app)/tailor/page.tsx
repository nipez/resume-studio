import { TailorPanel } from "@/components/tailor/tailor-panel";
import { JobDraftBootstrap } from "@/components/saved-jobs/job-draft-bootstrap";
import { getLibraryData, getResumeVersion } from "@/lib/resume/actions";

type PageProps = {
  searchParams: Promise<{ v?: string; r?: string; new?: string; job?: string }>;
};

export default async function TailorPage({ searchParams }: PageProps) {
  const { v, r, new: newParam, job } = await searchParams;
  const { versions, defaultVersionId } = await getLibraryData();
  const initialVersionId =
    v && versions.some((version) => version.id === v) ? v : null;

  let initialResultVersion = null;
  if (r) {
    const result = await getResumeVersion(r);
    if (result && versions.some((version) => version.id === r)) {
      initialResultVersion = result;
    }
  }

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1180px] px-11 pb-16 pt-10">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Tailor to a Job
        </h1>
        <p className="mt-2 max-w-[640px] text-[14.5px] text-muted">
          Four steps: add the job, review your tailored resume, write a cover
          letter, then log the application. Job details stay filled while you
          move between steps — choose Start new job when you&apos;re ready for a
          different role.
        </p>
        <div className="mt-[26px]">
          <JobDraftBootstrap savedJobId={job ?? null} />
          <TailorPanel
            versions={versions}
            defaultVersionId={defaultVersionId}
            initialVersionId={initialVersionId}
            initialResultVersion={initialResultVersion}
            startNewJob={newParam === "1" && !job}
            savedJobId={job ?? null}
          />
        </div>
      </div>
    </div>
  );
}
