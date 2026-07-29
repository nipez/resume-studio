"use client";

import { EditableVersionName } from "@/components/library/editable-version-name";
import { LogApplicationButton } from "@/components/applications/log-application-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { VersionJobLink } from "@/lib/applications/types";
import {
  archiveResumeVersion,
  createResumeVersion,
  deleteResumeVersion,
  restoreResumeVersion,
  setDefaultResumeVersion,
} from "@/lib/resume/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { suggestedNameFromJob, versionCardMeta } from "@/lib/resume/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

const ROW_GRID =
  "grid-cols-[minmax(220px,1.55fr)_minmax(112px,0.5fr)_minmax(112px,0.5fr)_48px_64px_auto]";
const ROW_GAP = "gap-x-3";

type VersionRowProps = {
  version: ResumeVersion;
  isDefault: boolean;
  appCount?: number;
  jobLinks?: VersionJobLink[];
  archived?: boolean;
  isStudent?: boolean;
  /** Alternate-row shading for list readability. */
  striped?: boolean;
};

function resolveJob(version: ResumeVersion, jobLinks: VersionJobLink[]) {
  const role =
    version.tailored_for?.role?.trim() || jobLinks[0]?.role?.trim() || "";
  const company =
    version.tailored_for?.company?.trim() ||
    jobLinks[0]?.company?.trim() ||
    "";
  const href = jobLinks[0]
    ? `/applications/${jobLinks[0].applicationId}`
    : role || company
      ? "/applications"
      : null;
  return {
    role,
    company,
    href,
    moreCount: jobLinks.length > 1 ? jobLinks.length - 1 : 0,
  };
}

export function VersionRow({
  version,
  isDefault,
  appCount = 0,
  jobLinks = [],
  archived = false,
  isStudent = false,
  striped = false,
}: VersionRowProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmKind, setConfirmKind] = useState<"archive" | "delete" | null>(
    null
  );
  const [editRequest, setEditRequest] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const meta = versionCardMeta(version);
  const job = resolveJob(version, jobLinks);
  const suggestedName =
    suggestedNameFromJob(job.role, job.company) || null;

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function run(action: () => Promise<void>) {
    setError(null);
    setMenuOpen(false);
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  const rowTone = archived
    ? "bg-[#F5F6F8]"
    : striped
      ? "bg-[#F7F8FA]"
      : "bg-white";

  return (
    <div
      className={`grid ${ROW_GRID} items-start ${ROW_GAP} gap-y-1 border-b border-[#E8EBEE] px-[22px] py-4 last:border-b-0 transition-colors hover:bg-[#EEF6F5] ${rowTone}`}
    >
      <div className="min-w-0">
        <div className="flex min-w-0 items-start gap-2">
          <EditableVersionName
            versionId={version.id}
            name={version.name}
            compact
            editRequest={editRequest}
            suggestedName={suggestedName}
            className="min-w-0 flex-1"
          />
          {isDefault ? (
            <span className="mt-1 shrink-0 rounded-md bg-[#F0ECFF] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em] text-[#5638E0]">
              Default
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[#8A92A0]">
          {meta.headline}
        </div>
        {!archived ? (
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            <Link
              href={`/tailor?v=${version.id}&new=1`}
              className="text-[11px] font-semibold text-[#6B4EFF] hover:underline"
            >
              Tailor
            </Link>
            <Link
              href={`/cover?v=${version.id}`}
              className="text-[11px] font-semibold text-[#6B4EFF] hover:underline"
            >
              Cover
            </Link>
          </div>
        ) : null}
        {error ? <p className="mt-1 text-[11px] text-[#B23B3B]">{error}</p> : null}
      </div>

      <div className="min-w-0 pt-0.5">
        {job.role || job.company ? (
          job.href ? (
            <Link
              href={job.href}
              className="block break-words text-[13.5px] font-semibold leading-[1.35] text-ink hover:text-accent hover:underline"
              title={job.role || undefined}
            >
              {job.role || "—"}
            </Link>
          ) : (
            <p
              className="break-words text-[13.5px] font-semibold leading-[1.35] text-ink"
              title={job.role || undefined}
            >
              {job.role || "—"}
            </p>
          )
        ) : (
          <Link
            href={`/tailor?v=${version.id}&new=1`}
            className="text-[12.5px] font-semibold text-accent hover:underline"
          >
            + Add role
          </Link>
        )}
        {job.moreCount > 0 ? (
          <Link
            href="/applications"
            className="mt-1 inline-block text-[11px] font-semibold text-muted hover:underline"
          >
            +{job.moreCount} more apps
          </Link>
        ) : null}
      </div>

      <div className="min-w-0 pt-0.5">
        {job.company ? (
          job.href ? (
            <Link
              href={job.href}
              className="block break-words text-[13.5px] font-semibold leading-[1.35] text-ink hover:text-accent hover:underline"
              title={job.company}
            >
              {job.company}
            </Link>
          ) : (
            <p
              className="break-words text-[13.5px] font-semibold leading-[1.35] text-ink"
              title={job.company}
            >
              {job.company}
            </p>
          )
        ) : job.role ? (
          <span className="text-[12.5px] text-[#9AA3AF]">No company</span>
        ) : (
          <span className="text-[12.5px] text-[#9AA3AF]">—</span>
        )}
      </div>

      <div className="pt-0.5 text-[12.5px]">
        {archived ? (
          appCount > 0 ? (
            <Link
              href="/applications"
              className="font-semibold text-[#6B4EFF] hover:underline"
            >
              {appCount}
            </Link>
          ) : (
            <span className="text-[#9AA3AF]">—</span>
          )
        ) : appCount === 0 ? (
          <LogApplicationButton
            versionId={version.id}
            resumeVersionName={version.name}
            initialRole={job.role}
            initialCompany={job.company}
            isStudent={isStudent}
            className="border-none bg-transparent p-0 text-[12px] font-semibold text-[#0E7C4B] shadow-none hover:bg-transparent hover:underline disabled:opacity-50"
          >
            Log
          </LogApplicationButton>
        ) : (
          <Link
            href="/applications"
            className="font-semibold text-[#0E7C4B] hover:underline"
          >
            {appCount}
          </Link>
        )}
      </div>

      <div className="pt-0.5 text-[12px] text-[#8A92A0]">
        {meta.updated.replace("Updated ", "")}
      </div>

      <div className="flex items-start justify-end gap-1.5 pt-0.5">
        <Link
          href={`/editor/${version.id}`}
          className="rounded-lg bg-accent px-3 py-[6px] text-[11.5px] font-semibold text-white transition-colors hover:bg-accent-dark"
        >
          Editor
        </Link>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            disabled={pending}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-border bg-white text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            title="More actions"
          >
            <span className="sr-only">More actions</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
          {menuOpen ? (
            <div
              id={menuId}
              role="menu"
              className="absolute right-0 z-20 mt-1.5 min-w-[168px] overflow-hidden rounded-xl border border-border bg-white py-1 shadow-[0_12px_32px_rgba(15,17,22,0.12)]"
            >
              <button
                type="button"
                role="menuitem"
                disabled={pending}
                onClick={() => {
                  setMenuOpen(false);
                  setEditRequest((n) => n + 1);
                }}
                className="flex w-full cursor-pointer border-none bg-transparent px-3.5 py-2 text-left text-[13px] font-semibold text-ink hover:bg-[#F7F8FA] disabled:opacity-50"
              >
                Rename
              </button>
              <button
                type="button"
                role="menuitem"
                disabled={pending}
                onClick={() =>
                  run(async () => {
                    const copy = await createResumeVersion(version.id);
                    router.push(`/editor/${copy.id}`);
                  })
                }
                className="flex w-full cursor-pointer border-none bg-transparent px-3.5 py-2 text-left text-[13px] font-semibold text-ink hover:bg-[#F7F8FA] disabled:opacity-50"
              >
                Duplicate
              </button>
              {!archived && !isDefault ? (
                <button
                  type="button"
                  role="menuitem"
                  disabled={pending}
                  onClick={() =>
                    run(async () => {
                      await setDefaultResumeVersion(version.id);
                    })
                  }
                  className="flex w-full cursor-pointer border-none bg-transparent px-3.5 py-2 text-left text-[13px] font-semibold text-ink hover:bg-[#F7F8FA] disabled:opacity-50"
                >
                  Set as default
                </button>
              ) : null}
              {archived ? (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    onClick={() =>
                      run(async () => {
                        await restoreResumeVersion(version.id);
                      })
                    }
                    className="flex w-full cursor-pointer border-none bg-transparent px-3.5 py-2 text-left text-[13px] font-semibold text-ink hover:bg-[#F7F8FA] disabled:opacity-50"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmKind("delete");
                    }}
                    className="flex w-full cursor-pointer border-none bg-transparent px-3.5 py-2 text-left text-[13px] font-semibold text-[#B23B3B] hover:bg-[#FFF4F4] disabled:opacity-50"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  disabled={pending}
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmKind("archive");
                  }}
                  className="flex w-full cursor-pointer border-none bg-transparent px-3.5 py-2 text-left text-[13px] font-semibold text-[#5A6573] hover:bg-[#F7F8FA] disabled:opacity-50"
                >
                  Archive
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmKind !== null}
        title={
          confirmKind === "delete"
            ? "Delete this resume permanently?"
            : "Archive this resume?"
        }
        description={
          confirmKind === "delete"
            ? "This archived resume will be permanently deleted. Logged applications keep their snapshots. This cannot be undone."
            : "It moves out of the Tailor and Cover pickers. Logged applications keep their snapshot — you can restore it anytime."
        }
        confirmLabel={confirmKind === "delete" ? "Delete" : "Archive"}
        danger={confirmKind === "delete"}
        pending={pending}
        onConfirm={() => {
          const kind = confirmKind;
          setConfirmKind(null);
          if (kind === "archive") {
            run(async () => {
              await archiveResumeVersion(version.id);
            });
          } else if (kind === "delete") {
            run(async () => {
              await deleteResumeVersion(version.id);
            });
          }
        }}
        onCancel={() => setConfirmKind(null)}
      />
    </div>
  );
}

export function VersionTableHeader() {
  return (
    <div
      className={`grid ${ROW_GRID} ${ROW_GAP} border-b border-[#DCE1E6] bg-[#EEF1F4] px-[22px] py-3.5 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6573]`}
    >
      <div>Document</div>
      <div>Role</div>
      <div>Company</div>
      <div>Apps</div>
      <div>Updated</div>
      <div className="text-right">Actions</div>
    </div>
  );
}
