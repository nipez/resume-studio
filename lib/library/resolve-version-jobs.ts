import type { VersionJobLink } from "@/lib/applications/types";
import {
  parseJobFromVersionName,
  preferFullerLabel,
} from "@/lib/applications/utils";
import type { ResumeVersion } from "@/lib/resume/db-types";

export type ResolvedVersionJob = {
  role: string;
  company: string;
  applicationId: string | null;
  status: VersionJobLink["status"] | null;
  moreCount: number;
  links: VersionJobLink[];
};

function companyKey(value: string) {
  return value.trim().toLowerCase();
}

function rolesLooselyMatch(a: string, b: string) {
  const left = a.trim().toLowerCase();
  const right = b.trim().toLowerCase();
  if (!left || !right) return true;
  return (
    left.includes(right) ||
    right.includes(left) ||
    left.slice(0, 14) === right.slice(0, 14)
  );
}

/** Resolve role/company/status for a Documents row, including company-matched apps. */
export function resolveVersionJobs(
  version: ResumeVersion,
  versionJobs: Record<string, VersionJobLink[]>,
  allJobLinks: VersionJobLink[] = []
): ResolvedVersionJob {
  const fromName = parseJobFromVersionName(version.name);
  const tailoredRole = version.tailored_for?.role?.trim() || "";
  const tailoredCompany = version.tailored_for?.company?.trim() || "";

  const direct = versionJobs[version.id] ?? [];
  let links = direct;

  if (links.length === 0) {
    const company = companyKey(tailoredCompany || fromName.company);
    const roleHint = tailoredRole || fromName.role;
    if (company) {
      links = allJobLinks.filter((link) => {
        if (companyKey(link.company) !== company) return false;
        return rolesLooselyMatch(roleHint, link.role);
      });
    }
  }

  const primary = links[0] ?? null;
  const role = preferFullerLabel(
    preferFullerLabel(primary?.role, tailoredRole),
    fromName.role
  );
  const company = preferFullerLabel(
    preferFullerLabel(primary?.company, tailoredCompany),
    fromName.company
  );

  return {
    role,
    company,
    applicationId: primary?.applicationId ?? null,
    status: primary?.status ?? null,
    moreCount: links.length > 1 ? links.length - 1 : 0,
    links,
  };
}
