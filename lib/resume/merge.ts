import type { ResumeData, ResumeEducation, ResumeExperience } from "@/lib/types/resume";
import { normalizeResumeData } from "@/lib/resume/defaults";

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function uniqueStrings(items: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const trimmed = String(item ?? "").trim();
    if (!trimmed) continue;
    const key = normalizeKey(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function pickFilled(primary: string | undefined, secondary: string | undefined): string {
  const left = String(primary ?? "").trim();
  if (left) return left;
  return String(secondary ?? "").trim();
}

function pickLonger(primary: string | undefined, secondary: string | undefined): string {
  const left = String(primary ?? "").trim();
  const right = String(secondary ?? "").trim();
  return right.length > left.length ? right : left;
}

function roleKey(role: ResumeExperience): string {
  const company = normalizeKey(role.company);
  const title = normalizeKey(role.title);
  if (company || title) return `${company}|${title}`;
  return `anon|${normalizeKey(role.dates)}|${normalizeKey(role.blurb ?? "")}`;
}

function educationKey(item: ResumeEducation): string {
  const school = normalizeKey(item.school);
  const degree = normalizeKey(item.degree);
  if (school || degree) return `${school}|${degree}`;
  return `anon|${normalizeKey(item.year)}`;
}

function mergeRoleLists(
  primary: ResumeExperience[],
  secondary: ResumeExperience[]
): ResumeExperience[] {
  const map = new Map<string, ResumeExperience>();
  const order: string[] = [];

  function add(role: ResumeExperience) {
    const key = roleKey(role);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        company: role.company,
        title: role.title,
        dates: role.dates,
        blurb: role.blurb ?? "",
        bullets: uniqueStrings(role.bullets ?? []),
      });
      order.push(key);
      return;
    }
    map.set(key, {
      company: pickFilled(existing.company, role.company),
      title: pickFilled(existing.title, role.title),
      dates: pickFilled(existing.dates, role.dates),
      blurb: pickLonger(existing.blurb, role.blurb),
      bullets: uniqueStrings([...(existing.bullets ?? []), ...(role.bullets ?? [])]),
    });
  }

  for (const role of primary) add(role);
  for (const role of secondary) add(role);
  return order.map((key) => map.get(key)!);
}

function mergeEducation(
  primary: ResumeEducation[],
  secondary: ResumeEducation[]
): ResumeEducation[] {
  const map = new Map<string, ResumeEducation>();
  const order: string[] = [];

  function add(item: ResumeEducation) {
    const key = educationKey(item);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        school: item.school,
        degree: item.degree,
        year: item.year,
      });
      order.push(key);
      return;
    }
    map.set(key, {
      school: pickFilled(existing.school, item.school),
      degree: pickFilled(existing.degree, item.degree),
      year: pickFilled(existing.year, item.year),
    });
  }

  for (const item of primary) add(item);
  for (const item of secondary) add(item);
  return order.map((key) => map.get(key)!);
}

function mergeHeadline(primary: string, secondary: string): string {
  const left = primary.trim();
  const right = secondary.trim();
  if (!left) return right;
  if (!right || normalizeKey(left) === normalizeKey(right)) return left;
  return left;
}

function mergeSummary(primary: string, secondary: string): string {
  const left = primary.trim();
  const right = secondary.trim();
  if (!left) return right;
  if (!right || normalizeKey(left) === normalizeKey(right)) return left;
  return `${left} ${right}`.trim();
}

/** Deterministic fact-only merge. Primary wins for contact and headline. */
export function mergeResumeData(
  primaryInput: ResumeData,
  secondaryInput: ResumeData
): ResumeData {
  const primary = normalizeResumeData(primaryInput);
  const secondary = normalizeResumeData(secondaryInput);

  return normalizeResumeData({
    name: pickFilled(primary.name, secondary.name),
    headline: mergeHeadline(primary.headline, secondary.headline),
    phone: pickFilled(primary.phone, secondary.phone),
    email: pickFilled(primary.email, secondary.email),
    location: pickFilled(primary.location, secondary.location),
    linkedin: pickFilled(primary.linkedin, secondary.linkedin),
    summary: mergeSummary(primary.summary, secondary.summary),
    skills: uniqueStrings([...(primary.skills ?? []), ...(secondary.skills ?? [])]),
    experience: mergeRoleLists(primary.experience ?? [], secondary.experience ?? []),
    activities: mergeRoleLists(primary.activities ?? [], secondary.activities ?? []),
    education: mergeEducation(primary.education ?? [], secondary.education ?? []),
    awards: uniqueStrings([...(primary.awards ?? []), ...(secondary.awards ?? [])]),
    accentColor: primary.accentColor || secondary.accentColor,
  });
}

export function hybridVersionName(primaryName: string, secondaryName: string): string {
  const a = primaryName.trim() || "Resume A";
  const b = secondaryName.trim() || "Resume B";
  const full = `Hybrid: ${a} + ${b}`;
  if (full.length <= 90) return full;
  const trim = (value: string, max: number) =>
    value.length <= max ? value : `${value.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
  return `Hybrid: ${trim(a, 32)} + ${trim(b, 32)}`;
}

export function isUsableCombinedResume(data: ResumeData | null | undefined): boolean {
  if (!data) return false;
  const experience = data.experience?.filter(
    (role) => role.company.trim() || role.title.trim() || (role.bullets ?? []).some(Boolean)
  );
  return Boolean(data.name?.trim() || (experience && experience.length > 0));
}

/** Keep primary contact/identity even if the model rewrote it. */
export function lockCombinedContact(
  combined: ResumeData,
  primary: ResumeData,
  secondary: ResumeData
): ResumeData {
  const fallback = mergeResumeData(primary, secondary);
  return normalizeResumeData({
    ...combined,
    name: fallback.name,
    phone: fallback.phone,
    email: fallback.email,
    location: fallback.location,
    linkedin: fallback.linkedin,
  });
}
