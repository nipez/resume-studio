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
      <div className="flex flex-wrap gap-2.5">
        <Link
          href={buildHref}
          className="inline-flex items-center gap-1.5 rounded-[11px] border border-[#DCE0E6] bg-white px-[17px] py-[11px] text-[13.5px] font-semibold text-[#3a4350] transition-colors hover:bg-[#F4F5F7]"
        >
          ✎ Build
        </Link>
        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-[11px] border border-[#DCE0E6] bg-white px-[17px] py-[11px] text-[13.5px] font-semibold text-[#3a4350] transition-colors hover:bg-[#F4F5F7]"
        >
          ↑ Import
        </button>
        <Link
          href="/tailor?new=1"
          className="inline-flex items-center gap-1.5 rounded-[11px] border border-[#D6E4FF] bg-[#F5F8FF] px-[17px] py-[11px] text-[13.5px] font-semibold text-[#2456D6] transition-colors hover:border-accent hover:bg-[#EAF1FF]"
        >
          ⌖ Tailor
        </Link>
        <LibraryToolbar createLabel={createLabel} />
      </div>
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
