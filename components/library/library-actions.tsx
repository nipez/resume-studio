"use client";

import { LibraryToolbar } from "@/components/library/library-toolbar";
import { ImportModal } from "@/components/import/import-modal";
import Link from "next/link";
import { useState } from "react";

export function LibraryActions({
  buildHref = "/build",
  createLabel = "+ New version",
}: {
  buildHref?: string;
  createLabel?: string;
}) {
  const [importOpen, setImportOpen] = useState(false);

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
        <LibraryToolbar createLabel={createLabel} />
      </div>
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
