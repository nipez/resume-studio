import { TailorPanel } from "@/components/tailor/tailor-panel";
import { getLibraryData } from "@/lib/resume/actions";

type PageProps = {
  searchParams: Promise<{ v?: string }>;
};

export default async function TailorPage({ searchParams }: PageProps) {
  const { v } = await searchParams;
  const { versions, defaultVersionId } = await getLibraryData();
  const initialVersionId =
    v && versions.some((version) => version.id === v) ? v : null;

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1180px] px-11 pb-16 pt-10">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Tailor to a Job
        </h1>
        <p className="mt-2 max-w-[640px] text-[14.5px] text-muted">
          Paste a job description (or import from a career-page URL) and AI will
          rewrite a version&apos;s summary, prioritize the right skills, surface the
          most relevant roles, and sharpen bullets — without changing your master
          copy.
        </p>
        <div className="mt-[26px]">
          <TailorPanel
            versions={versions}
            defaultVersionId={defaultVersionId}
            initialVersionId={initialVersionId}
          />
        </div>
      </div>
    </div>
  );
}
