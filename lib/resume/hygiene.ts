/**
 * Production data hygiene — hide internal probes, normalize messy titles,
 * and prefer real master resumes over copy stubs.
 */

const INTERNAL_NAME_PATTERNS = [
  /credit\s*probe/i,
  /internal\s*check/i,
  /\binternal\s*test\b/i,
  /\btest\s*artifact\b/i,
  /\bmcp\s*probe\b/i,
];

export function isCopyVersionName(name: string | null | undefined): boolean {
  return /\(\s*copy(?:\s*\d+)?\s*\)\s*$/i.test(String(name ?? "").trim());
}

export function isInternalVersionName(name: string | null | undefined): boolean {
  const value = String(name ?? "").trim();
  if (!value) return false;
  return INTERNAL_NAME_PATTERNS.some((pattern) => pattern.test(value));
}

export function isInternalApplication(input: {
  role?: string | null;
  company?: string | null;
  resume_version_name?: string | null;
}): boolean {
  const haystack = [input.role, input.company, input.resume_version_name]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" · ");
  return isInternalVersionName(haystack);
}

/** Strip trailing "(copy)" / "(copy 2)" noise for display. */
export function stripCopySuffix(name: string): string {
  return name.replace(/\s*\(\s*copy(?:\s*\d+)?\s*\)\s*$/i, "").trim();
}

/**
 * Clean truncated / duplicated document titles like
 * "Sr. Account Executive, Alcoho · Amazon" when company is repeated.
 */
export function normalizeDocumentTitle(input: {
  role?: string | null;
  company?: string | null;
  name?: string | null;
}): string {
  let role = String(input.role ?? "").trim();
  let company = String(input.company ?? "").trim();
  const name = String(input.name ?? "").trim();

  if (!role && !company && name) {
    const parts = name.split(/\s*[·|–—-]\s*/);
    if (parts.length >= 2) {
      role = parts.slice(0, -1).join(" · ").trim();
      company = parts[parts.length - 1]?.trim() ?? "";
    } else {
      role = name;
    }
  }

  // If role already ends with the company (or a truncated company), drop it.
  if (role && company) {
    const roleLower = role.toLowerCase();
    const companyLower = company.toLowerCase();
    if (roleLower.endsWith(companyLower)) {
      role = role
        .slice(0, role.length - company.length)
        .replace(/[\s,|·–—-]+$/, "")
        .trim();
    } else {
      // Trailing ", Fragment" after a comma — truncated company/title garbage
      // e.g. "Sr. Account Executive, Alcoho" when company is shown separately.
      const maybePrefix = role.match(/[,|·–—-]\s*([A-Za-z]{3,})$/);
      const fragment = maybePrefix?.[1]?.toLowerCase() ?? "";
      if (fragment) {
        const isCompanyPrefix =
          companyLower.startsWith(fragment) && fragment.length < companyLower.length;
        const looksTruncated =
          fragment !== companyLower &&
          fragment.length <= 10 &&
          !/\s/.test(fragment);
        if (isCompanyPrefix || looksTruncated) {
          role = role.replace(/[,|·–—-]\s*[A-Za-z]{3,}$/, "").trim();
        }
      }
    }
  }

  role = role.replace(/\s{2,}/g, " ").trim();
  company = company.replace(/\s{2,}/g, " ").trim();

  if (role && company) return `${role} · ${company}`;
  return role || company || name || "Untitled";
}

export function pickPreferredBaseVersionId(input: {
  versions: Array<{ id: string; name: string }>;
  defaultVersionId?: string | null;
  initialVersionId?: string | null;
}): string {
  const { versions, defaultVersionId = null, initialVersionId = null } = input;
  const usable = versions.filter((v) => !isInternalVersionName(v.name));
  const pool = usable.length > 0 ? usable : versions;

  if (initialVersionId && pool.some((v) => v.id === initialVersionId)) {
    return initialVersionId;
  }

  if (defaultVersionId) {
    const preferred = pool.find(
      (v) => v.id === defaultVersionId && !isCopyVersionName(v.name)
    );
    if (preferred) return preferred.id;
    // Default points at a stale "(copy)" — fall through to a real master when one exists.
  }

  const nonCopy = pool.find((v) => !isCopyVersionName(v.name));
  if (nonCopy) return nonCopy.id;

  if (defaultVersionId && pool.some((v) => v.id === defaultVersionId)) {
    return defaultVersionId;
  }

  return pool[0]?.id ?? "";
}

/** Drop internal probe versions from user-facing lists. */
export function filterVisibleVersions<T extends { name: string }>(
  versions: T[]
): T[] {
  return versions.filter((v) => !isInternalVersionName(v.name));
}

/**
 * Prefer non-copy masters when both "Foo" and "Foo (copy)" exist.
 * Keeps unique tailored cuts that only exist as copies.
 */
export function dedupeCopyVersions<T extends { id: string; name: string }>(
  versions: T[]
): T[] {
  const byBase = new Map<string, T[]>();
  for (const version of versions) {
    const key = stripCopySuffix(version.name).toLowerCase() || version.id;
    const list = byBase.get(key) ?? [];
    list.push(version);
    byBase.set(key, list);
  }

  const result: T[] = [];
  Array.from(byBase.values()).forEach((group: T[]) => {
    const nonCopies = group.filter((v: T) => !isCopyVersionName(v.name));
    if (nonCopies.length > 0) {
      result.push(...nonCopies);
    } else {
      result.push(...group);
    }
  });
  return result;
}

/** Hide internal probe applications from user-facing lists. */
export function filterVisibleApplications<
  T extends {
    role?: string | null;
    company?: string | null;
    resume_version_name?: string | null;
  },
>(apps: T[]): T[] {
  return apps.filter((app) => !isInternalApplication(app));
}

/**
 * Collapse exact role+company duplicates (keep richest / newest).
 */
export function dedupeApplicationsByJob<
  T extends {
    id: string;
    role?: string | null;
    company?: string | null;
    applied_at?: string | null;
    status?: string | null;
  },
>(apps: T[]): T[] {
  const rank: Record<string, number> = {
    applied: 0,
    ghosted: 0,
    rejected: 0,
    not_applied: 0,
    response: 1,
    interview: 2,
    offer: 3,
  };

  const best = new Map<string, T>();
  for (const app of apps) {
    const role = String(app.role ?? "").trim().toLowerCase();
    const company = String(app.company ?? "").trim().toLowerCase();
    if (!role && !company) {
      best.set(`id:${app.id}`, app);
      continue;
    }
    const key = `${role}::${company}`;
    const existing = best.get(key);
    if (!existing) {
      best.set(key, app);
      continue;
    }

    const existingRank = rank[String(existing.status ?? "")] ?? 0;
    const nextRank = rank[String(app.status ?? "")] ?? 0;
    const existingTime = Date.parse(String(existing.applied_at ?? ""));
    const nextTime = Date.parse(String(app.applied_at ?? ""));

    const takeNext =
      nextRank > existingRank ||
      (nextRank === existingRank &&
        (Number.isFinite(nextTime) ? nextTime : 0) >
          (Number.isFinite(existingTime) ? existingTime : 0));

    if (takeNext) best.set(key, app);
  }

  const keepIds = new Set(Array.from(best.values()).map((a) => a.id));
  return apps.filter((app) => keepIds.has(app.id));
}
