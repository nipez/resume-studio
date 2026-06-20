"use client";

import { VersionCard } from "@/components/library/version-card";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { useState } from "react";

type LibraryViewProps = {
  activeVersions: ResumeVersion[];
  archivedVersions: ResumeVersion[];
  defaultVersionId: string | null;
  versionCounts: Record<string, number>;
  isStudent?: boolean;
};

export function LibraryView({
  activeVersions,
  archivedVersions,
  defaultVersionId,
  versionCounts,
  isStudent = false,
}: LibraryViewProps) {
  const [tab, setTab] = useState<"active" | "archived">("active");
  const visibleVersions = tab === "active" ? activeVersions : archivedVersions;

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
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
      </div>

      {visibleVersions.length > 0 ? (
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
