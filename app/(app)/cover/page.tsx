import { CoverPanel } from "@/components/cover/cover-panel";
import { getLibraryData } from "@/lib/resume/actions";

export default async function CoverPage() {
  const { versions, defaultVersionId } = await getLibraryData();

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1180px] px-11 pb-16 pt-10">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Cover Letter
        </h1>
        <p className="mt-2 max-w-[640px] text-[14.5px] text-muted">
          Generate a concise, confident letter tied to outcomes — then edit it
          inline and export. Shares the job description with the Tailor tab.
        </p>
        <div className="mt-[26px]">
          <CoverPanel versions={versions} defaultVersionId={defaultVersionId} />
        </div>
      </div>
    </div>
  );
}
