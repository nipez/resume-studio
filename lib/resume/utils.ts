import { templateLabel } from "@/lib/resume/build-resume-html";
import type { ResumeVersion } from "@/lib/resume/db-types";

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = 60_000;
  const h = 3_600_000;
  const day = 86_400_000;

  if (diff < m) return "just now";
  if (diff < h) return `${Math.floor(diff / m)}m ago`;
  if (diff < day) return `${Math.floor(diff / h)}h ago`;
  if (diff < day * 7) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatJobAssociationLabel(role?: string, company?: string) {
  const r = role?.trim() ?? "";
  const c = company?.trim() ?? "";
  if (r && c) return `${r} · ${c}`;
  return r || c || "";
}

export function suggestedNameFromJob(role?: string, company?: string) {
  return formatJobAssociationLabel(role, company);
}

export function isGenericResumeName(name: string) {
  const n = name.trim().toLowerCase();
  if (!n) return true;
  if (/(?:\s*\(copy\))+\s*$/i.test(name)) return true;
  if (/^untitled(\s+resume)?$/i.test(n)) return true;
  if (/^master(\s+resume)?$/i.test(n)) return true;
  if (/^new resume$/i.test(n)) return true;
  if (/^tailored$/i.test(n)) return true;
  return false;
}

export function versionCardMeta(version: ResumeVersion) {
  const roles = version.data.experience?.length ?? 0;
  const skills = version.data.skills?.length ?? 0;
  const tailored = version.tailored_for
    ? `Tailored: ${version.tailored_for.role ?? "role"}${
        version.tailored_for.company
          ? ` @ ${version.tailored_for.company}`
          : ""
      }`
    : "";

  return {
    headline: version.data.headline || "No headline yet",
    badge: templateLabel(version.template_style),
    meta: `${roles} roles · ${skills} skills`,
    updated: `Updated ${formatRelativeTime(version.updated_at)}`,
    tailored,
  };
}
