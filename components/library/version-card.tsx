"use client";

import {
  createResumeVersion,
  deleteResumeVersion,
  setDefaultResumeVersion,
} from "@/lib/resume/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { versionCardMeta } from "@/lib/resume/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type VersionCardProps = {
  version: ResumeVersion;
  isDefault: boolean;
};

export function VersionCard({ version, isDefault }: VersionCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const meta = versionCardMeta(version);

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-white p-5 transition-[border-color,box-shadow] hover:border-[#CDD3DB] hover:shadow-[0_8px_26px_rgba(15,17,22,0.07)]">
      <div className="flex items-start justify-between gap-2.5">
        <div className="font-display text-[17px] font-semibold leading-tight tracking-[-0.01em]">
          {version.name}
        </div>
        <div className="flex flex-none items-center gap-1.5">
          {isDefault && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#EEF3FF] px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.03em] text-[#1E54E6]">
              ★ Default
            </span>
          )}
          <span className="flex-none rounded-md bg-[#F1F3F6] px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.04em] text-[#6B7480]">
            {meta.badge}
          </span>
        </div>
      </div>

      <div className="mt-[7px] min-h-9 text-[12.8px] leading-[1.45] text-muted">
        {meta.headline}
      </div>

      {meta.tailored && (
        <div className="mt-2.5 inline-flex items-center gap-1.5 self-start rounded-[7px] bg-[#EAF1FF] px-2.5 py-1 text-[11.5px] font-semibold text-[#2456D6]">
          ⌖ {meta.tailored}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 border-t border-[#F0F1F4] pt-3 text-xs text-[#8A92A0]">
        <span>{meta.meta}</span>
        <span className="ml-auto">
          {isDefault ? (
            <span className="text-[#9AA3AF]">Your starting point</span>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  await setDefaultResumeVersion(version.id);
                })
              }
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-[#2456D6] hover:underline disabled:opacity-50"
            >
              ☆ Set as default
            </button>
          )}
        </span>
      </div>

      <div className="mt-2.5 flex gap-2">
        <Link
          href={`/editor/${version.id}`}
          className="flex flex-1 items-center justify-center rounded-[9px] bg-accent px-3 py-2 text-[12.5px] font-semibold text-white shadow-[0_3px_10px_rgba(47,107,255,0.28)] transition-colors hover:bg-[#1E54E6]"
        >
          Open editor
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(async () => {
              const copy = await createResumeVersion(version.id);
              router.push(`/editor/${copy.id}`);
            })
          }
          className="rounded-[9px] border border-border bg-white px-3 py-2 text-[12.5px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          Duplicate
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this resume version? This cannot be undone."))
              return;
            run(async () => {
              await deleteResumeVersion(version.id);
            });
          }}
          className="rounded-[9px] border border-[#F2D2D2] bg-[#FFF4F4] px-3 py-2 text-[12.5px] font-semibold text-[#B23B3B] transition-colors hover:bg-[#FCECEC] disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      <div className="mt-2 text-[11px] text-[#9AA3AF]">{meta.updated}</div>
      {error && <p className="mt-2 text-xs text-[#B23B3B]">{error}</p>}
    </div>
  );
}
