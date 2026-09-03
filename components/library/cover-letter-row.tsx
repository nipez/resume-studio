"use client";

import { coverLetterHref } from "@/lib/library/cover-letters";
import type { CoverLetter } from "@/lib/cover/types";
import Link from "next/link";

const ROW_GRID =
  "grid-cols-[minmax(210px,1.4fr)_minmax(150px,0.85fr)_minmax(110px,0.55fr)_minmax(122px,0.55fr)_64px_auto]";
const ROW_GAP = "gap-x-3";

function formatUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

type CoverLetterRowProps = {
  letter: CoverLetter;
  resumeName?: string | null;
  nested?: boolean;
  showResumeColumn?: boolean;
};

export function CoverLetterRow({
  letter,
  resumeName,
  nested = false,
  showResumeColumn = false,
}: CoverLetterRowProps) {
  const preview = letter.body.trim().replace(/\s+/g, " ").slice(0, 90);
  const href = coverLetterHref(letter);

  return (
    <div
      className={`grid ${ROW_GRID} items-start ${ROW_GAP} gap-y-1 rounded-xl border border-[#E8E4FF] bg-[#FAFAFF] px-4 py-3 shadow-[0_1px_2px_rgba(15,17,22,0.02)] transition-[border-color,background-color] hover:border-[#C9BCFF] hover:bg-[#F5F3FF] sm:px-5 ${
        nested ? "ml-4 border-l-[3px] border-l-[#B8A8FF] sm:ml-6" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 shrink-0 rounded-md bg-[#EDE9FF] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em] text-[#6B4EFF]">
            Cover
          </span>
          <div className="min-w-0">
            <Link
              href={href}
              className="block truncate text-[13.5px] font-semibold text-ink hover:text-accent hover:underline"
              title={letter.title}
            >
              {letter.title}
            </Link>
            {preview ? (
              <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[#8A92A0]">
                {preview}
                {letter.body.length > preview.length ? "…" : ""}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="whitespace-normal break-words text-[13.5px] font-semibold leading-[1.35] text-ink">
          {letter.role || "—"}
        </p>
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="whitespace-normal break-words text-[13.5px] font-semibold leading-[1.35] text-ink">
          {letter.company || "—"}
        </p>
      </div>

      <div className="min-w-0 pt-0.5">
        {showResumeColumn ? (
          resumeName ? (
            <span className="text-[12.5px] font-semibold text-[#5A6573]">
              {resumeName}
            </span>
          ) : (
            <span className="text-[12.5px] text-[#9AA3AF]">Unlinked</span>
          )
        ) : (
          <span className="text-[12.5px] text-[#9AA3AF]">—</span>
        )}
      </div>

      <div className="pt-0.5 text-[12px] text-[#8A92A0]">
        {formatUpdated(letter.updated_at)}
      </div>

      <div className="flex items-start justify-end pt-0.5">
        <Link
          href={href}
          className="rounded-lg bg-[#6B4EFF] px-3 py-[6px] text-[11.5px] font-semibold text-white transition-colors hover:bg-[#5638E0]"
        >
          Open
        </Link>
      </div>
    </div>
  );
}

export function CoverLetterTableHeader({
  showResumeColumn = false,
}: {
  showResumeColumn?: boolean;
}) {
  return (
    <div
      className={`grid ${ROW_GRID} ${ROW_GAP} rounded-xl border border-[#D5DAE0] bg-[#EEF1F4] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6573] sm:px-5`}
    >
      <div>Document</div>
      <div>Role</div>
      <div>Company</div>
      <div>{showResumeColumn ? "Resume" : "Status"}</div>
      <div>Updated</div>
      <div className="text-right">Actions</div>
    </div>
  );
}
