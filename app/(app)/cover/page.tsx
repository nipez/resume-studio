import { CoverPanel } from "@/components/cover/cover-panel";
import { PrepFlowStepper } from "@/components/shared/prep-flow-stepper";
import { listCoverLetters } from "@/lib/cover/actions";
import { getLibraryData } from "@/lib/resume/actions";

type PageProps = {
  searchParams: Promise<{ v?: string }>;
};

export default async function CoverPage({ searchParams }: PageProps) {
  const { v } = await searchParams;
  const [{ versions, defaultVersionId }, savedLetters] = await Promise.all([
    getLibraryData(),
    listCoverLetters(),
  ]);
  const initialVersionId =
    v && versions.some((version) => version.id === v) ? v : null;

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1180px] px-11 pb-16 pt-10">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Cover Letter
        </h1>
        <p className="mt-2 max-w-[640px] text-[14.5px] text-muted">
          Step 3 of your application prep — generate a letter tied to the job and
          your tailored resume. Use the progress bar to go back to your saved
          resume anytime.
        </p>
        {initialVersionId ? (
          <PrepFlowStepper
            currentStep={3}
            resultId={initialVersionId}
            className="mt-5"
          />
        ) : null}
        <div className="mt-[26px]">
          <CoverPanel
            versions={versions}
            defaultVersionId={defaultVersionId}
            savedLetters={savedLetters}
            initialVersionId={initialVersionId}
          />
        </div>
      </div>
    </div>
  );
}
