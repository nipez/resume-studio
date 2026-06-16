"use client";

import { updateApplicationCoverLetter } from "@/lib/applications/actions";
import type { CoverLetter } from "@/lib/cover/actions";
import { readJobDraft } from "@/lib/job-draft/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type CoverLetterControlsProps = {
  applicationId: string;
  role: string;
  company: string;
  savedLetters: CoverLetter[];
  onImported: (text: string) => void;
};

function letterMatchesApp(letter: CoverLetter, role: string, company: string) {
  const roleMatch =
    !letter.role.trim() ||
    !role.trim() ||
    letter.role.trim().toLowerCase() === role.trim().toLowerCase();
  const companyMatch =
    !letter.company.trim() ||
    !company.trim() ||
    letter.company.trim().toLowerCase() === company.trim().toLowerCase();
  return roleMatch && companyMatch;
}

export function CoverLetterControls({
  applicationId,
  role,
  company,
  savedLetters,
  onImported,
}: CoverLetterControlsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const draftCover =
    open && typeof window !== "undefined" ? readJobDraft().coverText.trim() : "";

  const sortedLetters = useMemo(() => {
    return [...savedLetters].sort((a, b) => {
      const aMatch = letterMatchesApp(a, role, company) ? 0 : 1;
      const bMatch = letterMatchesApp(b, role, company) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return b.updated_at.localeCompare(a.updated_at);
    });
  }, [savedLetters, role, company]);

  function importText(text: string) {
    setError("");
    startTransition(async () => {
      try {
        await updateApplicationCoverLetter(applicationId, text);
        onImported(text);
        setOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not attach cover letter");
      }
    });
  }

  return (
    <div className="relative flex flex-wrap items-center gap-[7px]">
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer rounded-lg border-none bg-[#F2F3F5] px-[11px] py-1.5 text-xs font-semibold text-[#3a4350] transition-colors hover:bg-[#E6E8EC] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Attach cover letter"}
      </button>
      <Link
        href="/cover"
        className="rounded-lg px-[11px] py-1.5 text-xs font-semibold text-[#2456D6] hover:underline"
      >
        Write in Cover Letter →
      </Link>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-[300px] rounded-xl border border-[#E2E5EA] bg-white p-3 shadow-[0_12px_40px_rgba(15,17,22,0.12)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
            Attach what you sent
          </div>
          <p className="mt-1 text-[12px] leading-[1.45] text-muted">
            Import a saved letter or use the cover letter from your current job
            draft.
          </p>
          {draftCover ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => importText(draftCover)}
              className="mt-3 flex w-full cursor-pointer flex-col rounded-lg border border-[#D6E4FF] bg-[#F5F8FF] px-2.5 py-2 text-left transition-colors hover:border-accent disabled:opacity-60"
            >
              <span className="text-[13px] font-semibold text-[#2456D6]">
                Use current job draft
              </span>
              <span className="mt-0.5 line-clamp-2 text-[12px] text-muted">
                {draftCover.slice(0, 120)}
                {draftCover.length > 120 ? "…" : ""}
              </span>
            </button>
          ) : null}
          {sortedLetters.length > 0 ? (
            <div className="mt-3 max-h-[200px] overflow-auto">
              {sortedLetters.map((letter) => (
                <button
                  key={letter.id}
                  type="button"
                  disabled={pending}
                  onClick={() => importText(letter.body)}
                  className="mb-1 flex w-full cursor-pointer flex-col rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-[#E2E5EA] hover:bg-[#FAFBFC] disabled:opacity-60"
                >
                  <span className="text-[13px] font-semibold text-ink">
                    {letter.title}
                    {letterMatchesApp(letter, role, company) ? " · match" : ""}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[12px] text-muted">
                    {letter.body.slice(0, 100)}
                    {letter.body.length > 100 ? "…" : ""}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[12px] text-muted">
              No saved cover letters yet. Paste text below or{" "}
              <Link href="/cover" className="font-semibold text-[#2456D6] hover:underline">
                write one
              </Link>
              .
            </p>
          )}
          {error ? (
            <p className="mt-2 text-[12px] text-[#B23B3B]">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
