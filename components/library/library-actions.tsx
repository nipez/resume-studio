"use client";

import { LibraryToolbar } from "@/components/library/library-toolbar";
import { ImportModal } from "@/components/import/import-modal";
import { useState } from "react";

export function LibraryActions() {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-[11px] border border-[#DCE0E6] bg-white px-[17px] py-[11px] text-[13.5px] font-semibold text-[#3a4350] transition-colors hover:bg-[#F4F5F7]"
        >
          ↑ Import resume
        </button>
        <LibraryToolbar />
      </div>
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
