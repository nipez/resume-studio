import { formatJobAssociationLabel } from "@/lib/resume/utils";
import type { ResumeVersion } from "@/lib/resume/db-types";

export type ResumeSearchDoc = {
  id: string;
  name: string;
  headline: string;
  tailoredLabel: string | null;
  updatedAt: string;
  archived: boolean;
  isDefault: boolean;
};

export function toResumeSearchDoc(
  version: ResumeVersion,
  defaultVersionId?: string | null
): ResumeSearchDoc {
  return {
    id: version.id,
    name: version.name,
    headline: version.data.headline ?? "",
    tailoredLabel:
      formatJobAssociationLabel(
        version.tailored_for?.role,
        version.tailored_for?.company
      ) || null,
    updatedAt: version.updated_at,
    archived: Boolean(version.archived_at),
    isDefault: Boolean(defaultVersionId && version.id === defaultVersionId),
  };
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function haystack(doc: ResumeSearchDoc): string {
  return [doc.name, doc.headline, doc.tailoredLabel ?? ""].map(normalize).join(" ");
}

function nameRank(name: string, query: string): number {
  const n = normalize(name);
  if (n.startsWith(query)) return 0;
  if (n.includes(query)) return 1;
  return 2;
}

/** Filter resume docs by name (also matches headline / tailored job label). */
export function searchResumeDocs(
  docs: ResumeSearchDoc[],
  query: string
): ResumeSearchDoc[] {
  const q = normalize(query);
  if (!q) return [];

  return docs
    .filter((doc) => haystack(doc).includes(q))
    .sort((a, b) => {
      const aRank = nameRank(a.name, q);
      const bRank = nameRank(b.name, q);
      if (aRank !== bRank) return aRank - bRank;
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}
