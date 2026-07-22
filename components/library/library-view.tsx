"use client";

import { VersionCard } from "@/components/library/version-card";
import { VersionRow, VersionTableHeader } from "@/components/library/version-row";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { useEffect, useMemo, useState } from "react";

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
  if (typeof window === "undefined") return "table";
  const stored = window.localStorage.getItem(LIBRARY_VIEW_STORAGE_KEY);
  if (stored === "cards") return "cards";
  if (stored === "table") return "table";
  return "table";
}

function LayoutToggle({
  layout,
  onChange,
}: {
  layout: LibraryLayout;
  onChange: (layout: LibraryLayout) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-[12.5px] text-muted">
      <span className="hidden sm:inline">View:</span>
      <div
        className="flex items-center gap-1 rounded-[10px] border border-[#E2E5EA] bg-[#FAFBFC] p-1"
        role="group"
        aria-label="Library layout"
      >
        <button
          type="button"
          onClick={() => onChange("cards")}
          title="Grid view"
          className={`cursor-pointer rounded-[8px] border-none px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
            layout === "cards"
              ? "bg-white text-accent shadow-[0_1px_4px_rgba(15,17,22,0.08)]"
              : "bg-transparent text-[#5A6573] hover:text-ink"
          }`}
        >
          Grid
        </button>
        <button
          type="button"
          onClick={() => onChange("table")}
          title="List view"
          className={`cursor-pointer rounded-[8px] border-none px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
            layout === "table"
              ? "bg-white text-accent shadow-[0_1px_4px_rgba(15,17,22,0.08)]"
              : "bg-transparent text-[#5A6573] hover:text-ink"
          }`}
        >
          List
        </button>
      </div>
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
  const [tab, setTab] = useState<"all" | "active" | "archived">("all");
  const [layout, setLayout] = useState<LibraryLayout>("table");
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLayout(readStoredLayout());
    setReady(true);
  }, []);

  function handleLayoutChange(next: LibraryLayout) {
    setLayout(next);
    window.localStorage.setItem(LIBRARY_VIEW_STORAGE_KEY, next);
  }

  const effectiveLayout = ready ? layout : "table";

  const visibleVersions = useMemo(() => {
    const pool =
      tab === "archived"
        ? archivedVersions
        : tab === "active"
          ? activeVersions
          : [...activeVersions, ...archivedVersions];
    const q = query.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((v) => {
      const tailored = v.tailored_for
        ? `${v.tailored_for.role ?? ""} ${v.tailored_for.company ?? ""}`
        : "";
      const hay = `${v.name} ${v.data.headline ?? ""} ${tailored}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tab, activeVersions, archivedVersions, query]);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 border-b border-[#EEF0F3]">
          {(
            [
              {
                id: "all" as const,
                label: "All documents",
                count: activeVersions.length + archivedVersions.length,
              },
              {
                id: "active" as const,
                label: "Resumes",
                count: activeVersions.length,
              },
              {
                id: "archived" as const,
                label: "Archived",
                count: archivedVersions.length,
              },
            ] as const
          ).map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`cursor-pointer border-b-2 px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors ${
                  active
                    ? "border-teal text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {item.label}
                {item.count > 0 ? (
                  <span className="ml-1.5 text-[12px] font-bold opacity-75">
                    ({item.count})
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents…"
              aria-label="Search documents"
              className="w-full rounded-full border border-[#DFE3E8] bg-white py-2 pl-9 pr-3 text-[13px] text-ink placeholder:text-[#9AA3AF] focus:border-accent focus:outline-none"
            />
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA3AF]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </div>
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
                  archived={Boolean(version.archived_at)}
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
                archived={Boolean(version.archived_at)}
                isStudent={isStudent}
              />
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
          <p className="text-[14px] text-muted">
            {query.trim()
              ? `No documents match “${query.trim()}”.`
              : tab === "archived"
                ? "No archived resumes. Archive old tailored cuts to keep your library focused — application snapshots are preserved."
                : "No documents yet. Click + Create to add your first resume."}
          </p>
        </div>
      )}
    </>
  );
}
