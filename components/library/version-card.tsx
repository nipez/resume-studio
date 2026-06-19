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

type VersionCardProps = {
  version: ResumeVersion;
  isDefault: boolean;
  appCount?: number;
  archived?: boolean;
};

export function VersionCard({
  version,
  isDefault,
  appCount = 0,
  archived = false,
}: VersionCardProps) {
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
      className={`flex flex-col rounded-2xl border bg-white p-5 transition-[border-color,box-shadow] ${
        archived
          ? "border-[#E6E8EC] bg-[#FAFBFC] opacity-95 hover:border-[#CDD3DB]"
          : "border-border hover:border-[#CDD3DB] hover:shadow-[0_8px_26px_rgba(15,17,22,0.07)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <EditableVersionName
          versionId={version.id}
          name={version.name}
          className="min-w-0 flex-1"
        />
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
        {!archived ? (
          <>
            <Link
              href={`/tailor?v=${version.id}&new=1`}
              className="text-xs font-semibold text-[#2456D6] hover:underline"
            >
              Tailor from this →
            </Link>
            <Link
              href={`/cover?v=${version.id}`}
              className="text-xs font-semibold text-[#2456D6] hover:underline"
            >
              Cover letter →
            </Link>
          </>
        ) : null}
        {!archived ? (
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
        ) : null}
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
        {archived ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(async () => {
                await restoreResumeVersion(version.id);
              })
            }
            className="rounded-[9px] border border-[#D6E4FF] bg-[#F5F8FF] px-3 py-2 text-[12.5px] font-semibold text-[#2456D6] transition-colors hover:border-accent hover:bg-[#EAF1FF] disabled:opacity-50"
          >
            Restore
          </button>
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
            className="rounded-[9px] border border-[#E2E5EA] bg-[#FAFBFC] px-3 py-2 text-[12.5px] font-semibold text-[#5A6573] transition-colors hover:border-[#CFD5DD] hover:text-ink disabled:opacity-50"
          >
            Archive
          </button>
        )}
        {archived ? (
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
            className="rounded-[9px] border border-[#F2D2D2] bg-[#FFF4F4] px-3 py-2 text-[12.5px] font-semibold text-[#B23B3B] transition-colors hover:bg-[#FCECEC] disabled:opacity-50"
          >
            Delete
          </button>
        ) : null}
      </div>

      {!archived ? (
        appCount === 0 ? (
          <LogApplicationButton
            versionId={version.id}
            resumeVersionName={version.name}
            initialRole={version.tailored_for?.role ?? ""}
            initialCompany={version.tailored_for?.company ?? ""}
            className="mt-3 flex w-full items-center justify-center gap-[7px] rounded-[9px] border border-dashed border-[#C6D8CC] bg-white px-2 py-2 text-[12.5px] font-semibold text-[#0E7C4B] transition-colors hover:border-[#0E9F6E] hover:bg-[#F2FBF6] disabled:opacity-50"
          >
            ✓ Log application
          </LogApplicationButton>
        ) : (
          <div className="mt-3 flex items-center gap-2 rounded-[9px] border border-[#CDEBD9] bg-[#EAF7F0] px-[11px] py-2">
            <span className="inline-flex items-center gap-1.5 text-[12.3px] font-bold text-[#0E7C4B]">
              ✓ Used in {appCount === 1 ? "1 application" : `${appCount} applications`}
            </span>
            <Link
              href="/applications"
              className="ml-auto text-[11.5px] font-semibold text-[#0E7C4B] no-underline hover:underline"
            >
              View
            </Link>
            <LogApplicationButton
              versionId={version.id}
              resumeVersionName={version.name}
              initialRole={version.tailored_for?.role ?? ""}
              initialCompany={version.tailored_for?.company ?? ""}
              className="border-none bg-transparent p-0 text-[11.5px] font-semibold text-[#5d7a69] shadow-none hover:bg-transparent hover:text-[#0E7C4B] hover:underline disabled:opacity-50"
            >
              + Log again
            </LogApplicationButton>
          </div>
        )
      ) : appCount > 0 ? (
        <div className="mt-3 rounded-[9px] border border-[#E6E8EC] bg-[#F7F8FA] px-[11px] py-2 text-[12px] leading-[1.45] text-[#5A6573]">
          Used in {appCount === 1 ? "1 application" : `${appCount} applications`} — snapshot
          preserved.{" "}
          <Link href="/applications" className="font-semibold text-[#2456D6] hover:underline">
            View applications
          </Link>
        </div>
      ) : null}

      <div className="mt-2 text-[11px] text-[#9AA3AF]">{meta.updated}</div>
      {error && <p className="mt-2 text-xs text-[#B23B3B]">{error}</p>}
    </div>
  );
}
