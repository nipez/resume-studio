"use client";

import { VersionCard } from "@/components/library/version-card";
import { VersionRow, VersionTableHeader } from "@/components/library/version-row";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { useEffect, useState } from "react";

export const LIBRARY_VIEW_STORAGE_KEY = "resumetrakr-library-view";
export type LibraryLayout = "cards" | "table";

type LibraryViewProps = {
  activeVersions: ResumeVersion[];
  archivedVersions: ResumeVersion[];
  defaultVersionId: string | null;
  versionCounts: Record<string, number>;
  isStudent?: boolean;
};

function readStoredLayout(): LibraryLayout {
  if (typeof window === "undefined") return "cards";
  const stored = window.localStorage.getItem(LIBRARY_VIEW_STORAGE_KEY);
  return stored === "table" ? "table" : "cards";
}

function LayoutToggle({
  layout,
  onChange,
}: {
  layout: LibraryLayout;
  onChange: (layout: LibraryLayout) => void;
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-[10px] border border-[#E2E5EA] bg-[#FAFBFC] p-1"
      role="group"
      aria-label="Library layout"
    >
      <button
        type="button"
        onClick={() => onChange("cards")}
        className={`cursor-pointer rounded-[8px] border-none px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
          layout === "cards"
            ? "bg-white text-accent shadow-[0_1px_4px_rgba(15,17,22,0.08)]"
            : "bg-transparent text-[#5A6573] hover:text-ink"
        }`}
      >
        Cards
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={`cursor-pointer rounded-[8px] border-none px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
          layout === "table"
            ? "bg-white text-accent shadow-[0_1px_4px_rgba(15,17,22,0.08)]"
            : "bg-transparent text-[#5A6573] hover:text-ink"
        }`}
      >
        Table
      </button>
    </div>
  );
}

export function LibraryView({
  activeVersions,
  archivedVersions,
  defaultVersionId,
  versionCounts,
  isStudent = false,
}: LibraryViewProps) {
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [layout, setLayout] = useState<LibraryLayout>("cards");
  const [ready, setReady] = useState(false);
  const visibleVersions = tab === "active" ? activeVersions : archivedVersions;

  useEffect(() => {
    setLayout(readStoredLayout());
    setReady(true);
  }, []);

  function handleLayoutChange(next: LibraryLayout) {
    setLayout(next);
    window.localStorage.setItem(LIBRARY_VIEW_STORAGE_KEY, next);
  }

  const effectiveLayout = ready ? layout : "cards";

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`cursor-pointer rounded-[10px] border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
            tab === "active"
              ? "border-accent/30 bg-white text-accent shadow-[0_2px_10px_rgba(36,86,214,0.08)]"
              : "border-transparent bg-[#ECEEF1]/70 text-[#5A6573] hover:border-[#E2E5EA] hover:bg-white"
          }`}
        >
          Active
          {activeVersions.length > 0 ? (
            <span className="ml-1.5 text-[12px] font-bold opacity-80">
              {activeVersions.length}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setTab("archived")}
          className={`cursor-pointer rounded-[10px] border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
            tab === "archived"
              ? "border-accent/30 bg-white text-accent shadow-[0_2px_10px_rgba(36,86,214,0.08)]"
              : "border-transparent bg-[#ECEEF1]/70 text-[#5A6573] hover:border-[#E2E5EA] hover:bg-white"
          }`}
        >
          Archived
          {archivedVersions.length > 0 ? (
            <span className="ml-1.5 text-[12px] font-bold opacity-80">
              {archivedVersions.length}
            </span>
          ) : null}
        </button>
        <div className="ml-auto">
          <LayoutToggle layout={effectiveLayout} onChange={handleLayoutChange} />
        </div>
      </div>

      {visibleVersions.length > 0 ? (
        effectiveLayout === "table" ? (
          <div className="overflow-x-auto rounded-2xl border border-border bg-white">
            <div className="min-w-[860px]">
              <VersionTableHeader />
              {visibleVersions.map((version) => (
                <VersionRow
                  key={version.id}
                  version={version}
                  isDefault={version.id === defaultVersionId}
                  appCount={versionCounts[version.id] ?? 0}
                  archived={tab === "archived"}
                  isStudent={isStudent}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-[18px]">
            {visibleVersions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                isDefault={version.id === defaultVersionId}
                appCount={versionCounts[version.id] ?? 0}
                archived={tab === "archived"}
                isStudent={isStudent}
              />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
          <p className="text-[14px] text-muted">
            {tab === "active"
              ? "No active resume versions yet. Click + New version to create your first one."
              : "No archived resumes. Archive old tailored cuts to keep your library focused — application snapshots are preserved."}
          </p>
        </div>
      )}
    </>
  );
}
