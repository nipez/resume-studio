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
