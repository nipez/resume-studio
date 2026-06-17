import { QAPanel } from "@/components/questions/qa-panel";
import { JobDraftBootstrap } from "@/components/saved-jobs/job-draft-bootstrap";
import { getLibraryData } from "@/lib/resume/actions";

type PageProps = {
  searchParams: Promise<{ job?: string }>;
};

export default async function QuestionsPage({ searchParams }: PageProps) {
  const { job } = await searchParams;
  const { versions, defaultVersionId } = await getLibraryData();

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[920px] px-11 pb-16 pt-10">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Application Q&amp;A
        </h1>
        <p className="mt-2 mb-[22px] max-w-[640px] text-[14.5px] text-muted">
          Drop in the application&apos;s questions and generate answers in your
          voice — confident, specific, tied to real outcomes. Uses the shared job
          description for context.
        </p>
        <JobDraftBootstrap savedJobId={job ?? null} />
        <QAPanel versions={versions} defaultVersionId={defaultVersionId} />
      </div>
    </div>
  );
}
