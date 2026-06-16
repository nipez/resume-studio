import { TailorPanel } from "@/components/tailor/tailor-panel";
import { getLibraryData, getResumeVersion } from "@/lib/resume/actions";

type PageProps = {
  searchParams: Promise<{ v?: string; r?: string }>;
};

export default async function TailorPage({ searchParams }: PageProps) {
  const { v, r } = await searchParams;
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
          letter, then log the application so it shows up in your tracker.
        </p>
        <div className="mt-[26px]">
          <TailorPanel
            versions={versions}
            defaultVersionId={defaultVersionId}
            initialVersionId={initialVersionId}
            initialResultVersion={initialResultVersion}
          />
        </div>
      </div>
    </div>
  );
}
