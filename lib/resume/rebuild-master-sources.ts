import type { Application } from "@/lib/applications/types";
import type { ResumeVersion } from "@/lib/resume/db-types";

export const REBUILD_MASTER_MAX_SOURCES = 10;

export type RebuildMasterSourceReason = "application" | "tailored";

export type RebuildMasterSource = {
  version: ResumeVersion;
  reason: RebuildMasterSourceReason;
  activityAt: string;
};

type ScoredSource = {
  versionId: string;
  activityAt: string;
  reason: RebuildMasterSourceReason;
};

function maxIso(a: string, b: string): string {
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

/** Pick up to 10 non-default resumes that were tailored or used in applications. */
export function selectRebuildMasterSources(input: {
  defaultVersionId: string | null;
  activeVersions: ResumeVersion[];
  applications: Application[];
}): RebuildMasterSource[] {
  const { defaultVersionId, activeVersions, applications } = input;
  const versionById = new Map(activeVersions.map((v) => [v.id, v]));
  const scored = new Map<string, ScoredSource>();

  for (const app of applications) {
    const versionId = app.resume_version_id;
    if (!versionId || versionId === defaultVersionId) continue;
    if (!versionById.has(versionId)) continue;

    const activityAt = app.applied_at;
    const existing = scored.get(versionId);
    if (existing) {
      scored.set(versionId, {
        ...existing,
        activityAt: maxIso(existing.activityAt, activityAt),
        reason: existing.reason,
      });
    } else {
      scored.set(versionId, {
        versionId,
        activityAt,
        reason: "application",
      });
    }
  }

  for (const version of activeVersions) {
    if (version.id === defaultVersionId) continue;
    if (!version.tailored_for) continue;

    const activityAt = version.created_at;
    const existing = scored.get(version.id);
    if (existing) {
      scored.set(version.id, {
        ...existing,
        activityAt: maxIso(existing.activityAt, activityAt),
      });
    } else {
      scored.set(version.id, {
        versionId: version.id,
        activityAt,
        reason: "tailored",
      });
    }
  }

  return Array.from(scored.values())
    .sort(
      (a, b) =>
        new Date(b.activityAt).getTime() - new Date(a.activityAt).getTime()
    )
    .slice(0, REBUILD_MASTER_MAX_SOURCES)
    .map((entry) => {
      const version = versionById.get(entry.versionId)!;
      return {
        version,
        reason: entry.reason,
        activityAt: entry.activityAt,
      };
    });
}

export function formatRebuildSourceLabel(source: RebuildMasterSource): string {
  const job = source.version.tailored_for;
  if (job?.role || job?.company) {
    return [job.role, job.company].filter(Boolean).join(" · ");
  }
  return source.version.name;
}
