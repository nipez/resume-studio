"use client";

import type { ResumeVersion } from "@/lib/resume/db-types";
import { useEffect, useMemo, useState } from "react";

type VersionSelectProps = {
  versions: ResumeVersion[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  id?: string;
  defaultVersionId?: string | null;
  /** Explains that the base is not overwritten. */
  hint?: string;
};

function isCopyName(name: string) {
  return /\(copy\)\s*$/i.test(name.trim());
}

function sortVersions(
  versions: ResumeVersion[],
  defaultVersionId?: string | null
): ResumeVersion[] {
  return [...versions].sort((a, b) => {
    if (defaultVersionId) {
      if (a.id === defaultVersionId) return -1;
      if (b.id === defaultVersionId) return 1;
    }
    const aCopy = isCopyName(a.name);
    const bCopy = isCopyName(b.name);
    if (aCopy !== bCopy) return aCopy ? 1 : -1;
    return b.updated_at.localeCompare(a.updated_at);
  });
}

export function VersionSelect({
  versions,
  value,
  onChange,
  label = "Base version",
  id = "base-version",
  defaultVersionId = null,
  hint,
}: VersionSelectProps) {
  const [query, setQuery] = useState("");
  const sorted = useMemo(
    () => sortVersions(versions, defaultVersionId),
    [versions, defaultVersionId]
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((v) => v.name.toLowerCase().includes(q));
  }, [sorted, query]);

  const showSearch = versions.length >= 6;
  const selectValue = filtered.some((v) => v.id === value)
    ? value
    : filtered[0]?.id ?? "";

  // Keep parent in sync when search hides the currently selected option.
  useEffect(() => {
    if (selectValue && selectValue !== value) onChange(selectValue);
  }, [selectValue, value, onChange]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={showSearch ? `${id}-search` : id}
          className="text-[12.5px] font-semibold text-[#5A6573]"
        >
          {label}
        </label>
        {value === defaultVersionId ? (
          <span className="text-[11px] font-semibold text-[#1E54E6]">
            Using default
          </span>
        ) : null}
      </div>

      {showSearch ? (
        <input
          id={`${id}-search`}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resumes…"
          className="rounded-[9px] border border-[#DFE3E8] bg-white px-[11px] py-2 text-[13px] text-ink placeholder:text-[#9AA3AF] focus:border-accent focus:outline-none"
        />
      ) : null}

      <select
        id={id}
        value={selectValue}
        onChange={(e) => onChange(e.target.value)}
        size={showSearch ? Math.min(8, Math.max(4, filtered.length || 4)) : 1}
        className={`rounded-[9px] border border-[#DFE3E8] bg-white px-[11px] text-sm text-ink focus:border-accent focus:outline-none ${
          showSearch ? "py-1.5" : "py-2.5"
        }`}
      >
        {filtered.length === 0 ? (
          <option value="" disabled>
            No matching resumes
          </option>
        ) : (
          filtered.map((v) => {
            const isDefault = v.id === defaultVersionId;
            const copy = isCopyName(v.name);
            return (
              <option key={v.id} value={v.id}>
                {v.name}
                {isDefault ? " · Default" : ""}
                {copy && !isDefault ? " · copy stub" : ""}
              </option>
            );
          })
        )}
      </select>

      {hint ? (
        <p className="text-[11.5px] leading-snug text-[#8A92A0]">{hint}</p>
      ) : null}
    </div>
  );
}

const fieldClass =
  "rounded-[9px] border border-[#DFE3E8] px-[11px] py-2.5 text-sm text-ink focus:border-accent focus:outline-none";

export function JobRoleField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
      Role title
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="VP of Growth"
        className={fieldClass}
      />
    </label>
  );
}

export function JobCompanyField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
      Company
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Acme Health"
        className={fieldClass}
      />
    </label>
  );
}

export function JobDescField({
  value,
  onChange,
  rows = 12,
  label = "Job description",
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  label?: string;
}) {
  return (
    <label className="mt-3.5 flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
      {label}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder="Paste the full job description here…"
        className="resize-y rounded-[11px] border border-[#DFE3E8] p-3 text-[13.5px] leading-[1.55] text-[#1a1f29] focus:border-accent focus:outline-none"
      />
    </label>
  );
}

/** Optional posting link saved for later reference — does not import or scrape. */
export function JobUrlField({
  value,
  onChange,
  className = "mt-3.5",
  hint = "Saved for later — e.g. when you pasted the description from Indeed or LinkedIn. Not used to fetch the posting.",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  hint?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573] ${className}`}
    >
      Job posting URL (optional)
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://company.com/careers/role"
        className={fieldClass}
      />
      {hint ? (
        <span className="text-[11.5px] font-normal leading-snug text-[#8A92A0]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export const primaryBtnClass =
  "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[11px] bg-accent px-[18px] py-3 text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] transition-colors hover:bg-[#1E54E6] disabled:cursor-not-allowed disabled:opacity-60";

export const errorBoxClass =
  "mt-3 rounded-[9px] border border-[#F3D2D2] bg-[#FFF4F4] px-3 py-2.5 text-[13px] text-[#B23B3B]";

export const mockBannerClass =
  "mb-3 rounded-[9px] border border-[#D6E4FF] bg-[#EAF1FF] px-3 py-2 text-[12.5px] text-[#2456D6]";
