"use client";

import { DefaultResumeHero } from "@/components/library/default-resume-hero";
import {
  CoverLetterRow,
  CoverLetterTableHeader,
} from "@/components/library/cover-letter-row";
import { VersionCard } from "@/components/library/version-card";
import { VersionRow, VersionTableHeader } from "@/components/library/version-row";
import type { VersionJobLink } from "@/lib/applications/types";
import {
  coverLetterMatchesQuery,
  groupCoverLettersByResume,
  resolveResumeName,
} from "@/lib/library/cover-letters";
import type { CoverLetter } from "@/lib/cover/types";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { useEffect, useMemo, useState } from "react";

export const LIBRARY_VIEW_STORAGE_KEY = "resumetrakr-library-view";
export type LibraryLayout = "cards" | "table";

type LibraryViewProps = {
  activeVersions: ResumeVersion[];
  archivedVersions: ResumeVersion[];
  defaultVersionId: string | null;
  versionCounts: Record<string, number>;
  versionJobs?: Record<string, VersionJobLink[]>;
  allJobLinks?: VersionJobLink[];
  coverLetters?: CoverLetter[];
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
  versionJobs = {},
  allJobLinks = [],
  coverLetters = [],
  isStudent = false,
}: LibraryViewProps) {
  const [tab, setTab] = useState<"all" | "active" | "archived" | "covers">("all");
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

  const allVersions = useMemo(
    () => [...activeVersions, ...archivedVersions],
    [activeVersions, archivedVersions]
  );

  const lettersByResume = useMemo(
    () => groupCoverLettersByResume(coverLetters),
    [coverLetters]
  );

  const filteredCoverLetters = useMemo(() => {
    const q = query.trim();
    return coverLetters.filter((letter) => coverLetterMatchesQuery(letter, q));
  }, [coverLetters, query]);

  const orphanCoverLetters = useMemo(() => {
    const versionIds = new Set(allVersions.map((v) => v.id));
    return filteredCoverLetters.filter(
      (letter) =>
        !letter.resume_version_id || !versionIds.has(letter.resume_version_id)
    );
  }, [filteredCoverLetters, allVersions]);

  const defaultVersion = useMemo(() => {
    if (!defaultVersionId) return null;
    return (
      activeVersions.find((v) => v.id === defaultVersionId) ??
      archivedVersions.find((v) => v.id === defaultVersionId) ??
      null
    );
  }, [activeVersions, archivedVersions, defaultVersionId]);

  const defaultMatchesQuery = useMemo(() => {
    if (!defaultVersion) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const tailored = defaultVersion.tailored_for
      ? `${defaultVersion.tailored_for.role ?? ""} ${defaultVersion.tailored_for.company ?? ""}`
      : "";
    const company = (defaultVersion.tailored_for?.company ?? "")
      .trim()
      .toLowerCase();
    const linked = [
      ...(versionJobs[defaultVersion.id] ?? []),
      ...allJobLinks.filter(
        (j) => company && j.company.trim().toLowerCase() === company
      ),
    ]
      .map((j) => `${j.role} ${j.company} ${j.status}`)
      .join(" ");
    const hay =
      `${defaultVersion.name} ${defaultVersion.data.headline ?? ""} ${tailored} ${linked}`.toLowerCase();
    return hay.includes(q);
  }, [defaultVersion, query, versionJobs, allJobLinks]);

  const showDefaultHero =
    Boolean(defaultVersion) &&
    tab !== "archived" &&
    !defaultVersion?.archived_at &&
    defaultMatchesQuery;

  const visibleVersions = useMemo(() => {
    const pool =
      tab === "archived"
        ? archivedVersions
        : tab === "active"
          ? activeVersions
          : [...activeVersions, ...archivedVersions];
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? pool
      : pool.filter((v) => {
          const tailored = v.tailored_for
            ? `${v.tailored_for.role ?? ""} ${v.tailored_for.company ?? ""}`
            : "";
          const linked = (versionJobs[v.id] ?? [])
            .map((j) => `${j.role} ${j.company} ${j.status}`)
            .join(" ");
          const company = (v.tailored_for?.company ?? "").trim().toLowerCase();
          const matched = company
            ? allJobLinks
                .filter((j) => j.company.trim().toLowerCase() === company)
                .map((j) => `${j.role} ${j.company} ${j.status}`)
                .join(" ")
            : "";
          const hay =
            `${v.name} ${v.data.headline ?? ""} ${tailored} ${linked} ${matched}`.toLowerCase();
          return hay.includes(q);
        });

    // Primary resume is featured above — keep the list focused on other cuts.
    const withoutFeatured = showDefaultHero
      ? filtered.filter((v) => v.id !== defaultVersionId)
      : filtered;

    if (!defaultVersionId || showDefaultHero) return withoutFeatured;

    return [...withoutFeatured].sort((a, b) => {
      if (a.id === defaultVersionId) return -1;
      if (b.id === defaultVersionId) return 1;
      return 0;
    });
  }, [
    tab,
    activeVersions,
    archivedVersions,
    query,
    versionJobs,
    allJobLinks,
    showDefaultHero,
    defaultVersionId,
  ]);

  function lettersForVersion(versionId: string): CoverLetter[] {
    return (lettersByResume.get(versionId) ?? []).filter((letter) =>
      coverLetterMatchesQuery(letter, query)
    );
  }

  const showCoverLettersInAll = tab === "all" && effectiveLayout === "table";

  return (
    <>
      {showDefaultHero && defaultVersion ? (
        <DefaultResumeHero version={defaultVersion} />
      ) : null}

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
              {
                id: "covers" as const,
                label: "Cover letters",
                count: coverLetters.length,
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

      {showDefaultHero && visibleVersions.length > 0 ? (
        <div className="mb-3.5 flex items-center gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.07em] text-[#5A6573]">
            Other documents
          </h3>
          <div className="h-px flex-1 bg-[#E2E5EA]" aria-hidden />
          <span className="text-[12px] font-semibold text-[#8A92A0]">
            {visibleVersions.length}
          </span>
        </div>
      ) : null}

      {tab === "covers" ? (
        filteredCoverLetters.length > 0 ? (
          effectiveLayout === "table" ? (
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-[880px] flex-col gap-2.5">
                <CoverLetterTableHeader showResumeColumn />
                {filteredCoverLetters.map((letter) => (
                  <CoverLetterRow
                    key={letter.id}
                    letter={letter}
                    resumeName={resolveResumeName(
                      letter.resume_version_id,
                      allVersions
                    )}
                    showResumeColumn
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-[18px]">
              {filteredCoverLetters.map((letter) => (
                <CoverLetterRow
                  key={letter.id}
                  letter={letter}
                  resumeName={resolveResumeName(
                    letter.resume_version_id,
                    allVersions
                  )}
                  showResumeColumn
                />
              ))}
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
            <p className="text-[14px] text-muted">
              {query.trim()
                ? `No cover letters match “${query.trim()}”.`
                : "No saved cover letters yet. Generate one from any resume's Cover link."}
            </p>
          </div>
        )
      ) : visibleVersions.length > 0 || (showCoverLettersInAll && orphanCoverLetters.length > 0) ? (
        effectiveLayout === "table" ? (
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-[880px] flex-col gap-2.5">
              <VersionTableHeader />
              {visibleVersions.map((version, index) => {
                const nestedLetters = showCoverLettersInAll
                  ? lettersForVersion(version.id)
                  : [];
                return (
                  <div key={version.id} className="flex flex-col gap-2">
                    <VersionRow
                      version={version}
                      isDefault={version.id === defaultVersionId}
                      appCount={versionCounts[version.id] ?? 0}
                      jobLinks={versionJobs[version.id] ?? []}
                      allJobLinks={allJobLinks}
                      archived={Boolean(version.archived_at)}
                      isStudent={isStudent}
                      striped={index % 2 === 1}
                    />
                    {nestedLetters.map((letter) => (
                      <CoverLetterRow
                        key={letter.id}
                        letter={letter}
                        nested
                      />
                    ))}
                  </div>
                );
              })}
              {showCoverLettersInAll && orphanCoverLetters.length > 0 ? (
                <>
                  <div className="mt-2 flex items-center gap-3">
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.07em] text-[#5A6573]">
                      Cover letters (no linked resume)
                    </h3>
                    <div className="h-px flex-1 bg-[#E2E5EA]" aria-hidden />
                  </div>
                  {orphanCoverLetters.map((letter) => (
                    <CoverLetterRow key={letter.id} letter={letter} />
                  ))}
                </>
              ) : null}
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
                jobLinks={versionJobs[version.id] ?? []}
                coverLetters={
                  tab === "all"
                    ? lettersForVersion(version.id)
                    : []
                }
                archived={Boolean(version.archived_at)}
                isStudent={isStudent}
              />
            ))}
          </div>
        )
      ) : showDefaultHero ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-8 text-center">
          <p className="text-[14px] text-muted">
            {query.trim()
              ? `No other documents match “${query.trim()}”.`
              : "Your tailored cuts and copies will show up here."}
          </p>
        </div>
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
