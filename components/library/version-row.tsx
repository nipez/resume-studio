"use client";

import { EditableVersionName } from "@/components/library/editable-version-name";
import { LogApplicationButton } from "@/components/applications/log-application-button";
import {
  archiveResumeVersion,
  createResumeVersion,
  deleteResumeVersion,
  restoreResumeVersion,
  setDefaultResumeVersion,
} from "@/lib/resume/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { versionCardMeta } from "@/lib/resume/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type VersionRowProps = {
  version: ResumeVersion;
  isDefault: boolean;
  appCount?: number;
  archived?: boolean;
  isStudent?: boolean;
};

export function VersionRow({
  version,
  isDefault,
  appCount = 0,
  archived = false,
  isStudent = false,
}: VersionRowProps) {
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
    <div
      className={`grid grid-cols-[minmax(200px,1.6fr)_88px_100px_88px_88px_minmax(220px,auto)] items-center gap-3 border-b border-[#F2F3F5] px-[22px] py-3 last:border-b-0 ${
        archived ? "bg-[#FAFBFC]/80" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <EditableVersionName
            versionId={version.id}
            name={version.name}
            compact
            className="min-w-0 flex-1"
          />
          {isDefault ? (
            <span className="shrink-0 rounded-md bg-[#EEF3FF] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em] text-[#1E54E6]">
              Default
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-[#8A92A0]">{meta.headline}</div>
        {meta.tailored ? (
          <div className="mt-1 truncate text-[11px] font-semibold text-[#2456D6]">
            {meta.tailored}
          </div>
        ) : null}
        {!archived ? (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <Link
              href={`/tailor?v=${version.id}&new=1`}
              className="text-[11px] font-semibold text-[#2456D6] hover:underline"
            >
              Tailor
            </Link>
            <Link
              href={`/cover?v=${version.id}`}
              className="text-[11px] font-semibold text-[#2456D6] hover:underline"
            >
              Cover
            </Link>
          </div>
        ) : null}
        {error ? <p className="mt-1 text-[11px] text-[#B23B3B]">{error}</p> : null}
      </div>

      <div>
        <span className="inline-block rounded-md bg-[#F1F3F6] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#6B7480]">
          {meta.badge}
        </span>
      </div>

      <div className="text-[12.5px] text-[#5A6573]">{meta.meta}</div>

      <div className="text-[12.5px]">
        {archived ? (
          appCount > 0 ? (
            <Link href="/applications" className="font-semibold text-[#2456D6] hover:underline">
              {appCount}
            </Link>
          ) : (
            <span className="text-[#9AA3AF]">—</span>
          )
        ) : appCount === 0 ? (
          <LogApplicationButton
            versionId={version.id}
            resumeVersionName={version.name}
            initialRole={version.tailored_for?.role ?? ""}
            initialCompany={version.tailored_for?.company ?? ""}
            isStudent={isStudent}
            className="border-none bg-transparent p-0 text-[12px] font-semibold text-[#0E7C4B] shadow-none hover:bg-transparent hover:underline disabled:opacity-50"
          >
            Log
          </LogApplicationButton>
        ) : (
          <Link href="/applications" className="font-semibold text-[#0E7C4B] hover:underline">
            {appCount}
          </Link>
        )}
      </div>

      <div className="text-[12px] text-[#8A92A0]">{meta.updated.replace("Updated ", "")}</div>

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <Link
          href={`/editor/${version.id}`}
          className="rounded-lg bg-accent px-2.5 py-[6px] text-[11.5px] font-semibold text-white transition-colors hover:bg-[#1E54E6]"
        >
          Editor
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
          className="rounded-lg border border-border bg-white px-2.5 py-[6px] text-[11.5px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          Duplicate
        </button>
        {!archived && !isDefault ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(async () => {
                await setDefaultResumeVersion(version.id);
              })
            }
            className="rounded-lg border border-[#D6E4FF] bg-[#F5F8FF] px-2.5 py-[6px] text-[11.5px] font-semibold text-[#2456D6] transition-colors hover:border-accent disabled:opacity-50"
          >
            Default
          </button>
        ) : null}
        {archived ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(async () => {
                  await restoreResumeVersion(version.id);
                })
              }
              className="rounded-lg border border-[#D6E4FF] bg-[#F5F8FF] px-2.5 py-[6px] text-[11.5px] font-semibold text-[#2456D6] transition-colors hover:border-accent disabled:opacity-50"
            >
              Restore
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm("Delete this archived resume permanently? This cannot be undone."))
                  return;
                run(async () => {
                  await deleteResumeVersion(version.id);
                });
              }}
              className="rounded-lg border border-[#F2D2D2] bg-[#FFF4F4] px-2.5 py-[6px] text-[11.5px] font-semibold text-[#B23B3B] transition-colors hover:bg-[#FCECEC] disabled:opacity-50"
            >
              Delete
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (
                !confirm(
                  "Archive this resume? It will move out of Tailor and Cover pickers. Logged applications keep their snapshot."
                )
              ) {
                return;
              }
              run(async () => {
                await archiveResumeVersion(version.id);
              });
            }}
            className="rounded-lg border border-[#E2E5EA] bg-[#FAFBFC] px-2.5 py-[6px] text-[11.5px] font-semibold text-[#5A6573] transition-colors hover:border-[#CFD5DD] hover:text-ink disabled:opacity-50"
          >
            Archive
          </button>
        )}
      </div>
    </div>
  );
}

export function VersionTableHeader() {
  return (
    <div className="grid grid-cols-[minmax(200px,1.6fr)_88px_100px_88px_88px_minmax(220px,auto)] gap-3 border-b border-[#EEF0F3] bg-[#FAFBFC] px-[22px] py-[13px] text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
      <div>Resume</div>
      <div>Layout</div>
      <div>Content</div>
      <div>Apps</div>
      <div>Updated</div>
      <div className="text-right">Actions</div>
    </div>
  );
}
