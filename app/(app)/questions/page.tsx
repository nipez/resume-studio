import { QAPanel } from "@/components/questions/qa-panel";
import { JobDraftBootstrap } from "@/components/saved-jobs/job-draft-bootstrap";
import { getUserProfileContext } from "@/lib/profile/actions";
import { getLibraryData } from "@/lib/resume/actions";

type PageProps = {
  searchParams: Promise<{ job?: string; v?: string }>;
};

export default async function QuestionsPage({ searchParams }: PageProps) {
  const { job, v } = await searchParams;
  const [{ versions, defaultVersionId }, profile] = await Promise.all([
    getLibraryData(),
    getUserProfileContext(),
  ]);
  const prepFlowResultId =
    v && versions.some((version) => version.id === v) ? v : null;

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[920px] px-5 pb-16 sm:px-8 lg:px-11 pt-10">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Application Q&amp;A
        </h1>
        <p className="mt-2 mb-[22px] max-w-[640px] text-[14.5px] text-muted">
          {prepFlowResultId
            ? "Step 4 of 5: paste this portal's screening questions, generate answers in your voice, then log when you've submitted. Q&A is per job — prior applications stay separate."
            : "Drop in an application's questions and generate answers in your voice. Each job keeps its own Q&A so answers don't carry over."}
        </p>
        <JobDraftBootstrap savedJobId={job ?? null} />
        <QAPanel
          versions={versions}
          defaultVersionId={defaultVersionId}
          prepFlowResultId={prepFlowResultId}
          savedJobId={job ?? null}
          isStudent={profile.isStudent}
        />
      </div>
    </div>
  );
}
