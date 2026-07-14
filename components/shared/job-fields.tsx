"use client";

import type { ResumeVersion } from "@/lib/resume/db-types";

type VersionSelectProps = {
  versions: ResumeVersion[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  id?: string;
};

export function VersionSelect({
  versions,
  value,
  onChange,
  label = "Base version",
  id = "base-version",
}: VersionSelectProps) {
  return (
    <label
      htmlFor={id}
      className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]"
    >
      {label}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[9px] border border-[#DFE3E8] bg-white px-[11px] py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
      >
        {versions.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>
    </label>
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
