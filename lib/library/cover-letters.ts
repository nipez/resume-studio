import type { CoverLetter } from "@/lib/cover/types";
import type { ResumeVersion } from "@/lib/resume/db-types";

export function groupCoverLettersByResume(
  letters: CoverLetter[]
): Map<string, CoverLetter[]> {
  const map = new Map<string, CoverLetter[]>();
  for (const letter of letters) {
    const key = letter.resume_version_id ?? "";
    const list = map.get(key) ?? [];
    list.push(letter);
    map.set(key, list);
  }
  for (const list of Array.from(map.values())) {
    list.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }
  return map;
}

export function resolveResumeName(
  resumeVersionId: string | null,
  versions: ResumeVersion[]
): string | null {
  if (!resumeVersionId) return null;
  return versions.find((v) => v.id === resumeVersionId)?.name ?? null;
}

export function coverLetterHref(letter: CoverLetter): string {
  const params = new URLSearchParams({ letter: letter.id });
  if (letter.resume_version_id) {
    params.set("v", letter.resume_version_id);
  }
  return `/cover?${params.toString()}`;
}

export function coverLetterMatchesQuery(letter: CoverLetter, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    letter.title,
    letter.role,
    letter.company,
    letter.body.slice(0, 240),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}
