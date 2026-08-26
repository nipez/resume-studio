"use client";

import { CombineResumesModal } from "@/components/library/combine-resumes-modal";
import { LibraryToolbar } from "@/components/library/library-toolbar";
import { ImportModal } from "@/components/import/import-modal";
import type { ResumeVersion } from "@/lib/resume/db-types";
import Link from "next/link";
import { useState } from "react";

export function LibraryActions({
  buildHref = "/build",
  createLabel = "+ New version",
  versions = [],
  defaultVersionId = null,
}: {
  buildHref?: string;
  createLabel?: string;
  versions?: ResumeVersion[];
  defaultVersionId?: string | null;
}) {
  const [importOpen, setImportOpen] = useState(false);
  const [combineOpen, setCombineOpen] = useState(false);
  const canCombine = versions.filter((version) => !version.archived_at).length >= 2;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#3a4350] transition-colors hover:bg-soft"
        >
          Build
        </Link>
        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#3a4350] transition-colors hover:bg-soft"
        >
          Import
        </button>
        <Link
          href="/tailor?new=1"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#D9D2FF] bg-[#F7F5FF] px-4 py-2.5 text-[13.5px] font-semibold text-accent transition-colors hover:bg-[#F0ECFF]"
        >
          Tailor
        </Link>
        <button
          type="button"
          onClick={() => setCombineOpen(true)}
          disabled={!canCombine}
          title={
            canCombine
              ? "Blend two library versions into a new hybrid"
              : "Add a second resume to combine versions"
          }
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#D9D2FF] bg-[#F7F5FF] px-4 py-2.5 text-[13.5px] font-semibold text-accent transition-colors hover:bg-[#F0ECFF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Combine
        </button>
        <LibraryToolbar createLabel={createLabel} />
      </div>
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <CombineResumesModal
        open={combineOpen}
        onClose={() => setCombineOpen(false)}
        versions={versions}
        defaultVersionId={defaultVersionId}
      />
    </>
  );
}
