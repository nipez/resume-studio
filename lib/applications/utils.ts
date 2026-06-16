import type { Application, ApplicationEvent, ApplicationStatus } from "@/lib/applications/types";

export type StatusMeta = {
  label: string;
  fg: string;
  bg: string;
  bd: string;
};

export const APPLICATION_STATUSES: { id: ApplicationStatus; label: string }[] = [
  { id: "applied", label: "Applied" },
  { id: "response", label: "Response" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
  { id: "ghosted", label: "No response" },
];

export function appStatusMeta(id: ApplicationStatus | string): StatusMeta {
  const m: Record<ApplicationStatus, StatusMeta> = {
    applied: { label: "Applied", fg: "#1E54E6", bg: "#EAF1FF", bd: "#CFE0FF" },
    response: { label: "Response", fg: "#0C7C8C", bg: "#E1F6F9", bd: "#BDE6EC" },
    interview: { label: "Interview", fg: "#9A6212", bg: "#FEF3DA", bd: "#F1DDA6" },
    offer: { label: "Offer", fg: "#0E7C4B", bg: "#E6F7EE", bd: "#BFE8D1" },
    rejected: { label: "Rejected", fg: "#B23B3B", bg: "#FCECEC", bd: "#F2D2D2" },
    ghosted: { label: "No response", fg: "#8A92A0", bg: "#F2F3F5", bd: "#E2E5EA" },
  };
  return m[id as ApplicationStatus] ?? m.applied;
}

export function isPositiveStatus(status: ApplicationStatus): boolean {
  return status === "response" || status === "interview" || status === "offer";
}

/** Furthest pipeline stage reached (current status + history). */
const STAGE_RANK: Record<ApplicationStatus, number> = {
  applied: 0,
  ghosted: 0,
  rejected: 0,
  response: 1,
  interview: 2,
  offer: 3,
};

export function applicationPeakRank(app: Application): number {
  let rank = STAGE_RANK[app.status] ?? 0;
  for (const entry of app.status_history ?? []) {
    rank = Math.max(rank, STAGE_RANK[entry.status] ?? 0);
  }
  return rank;
}

export function computeApplicationStats(apps: Application[]) {
  const total = apps.length;
  let respondedCount = 0;
  let interviewCount = 0;
  let offerCount = 0;

  for (const app of apps) {
    const rank = applicationPeakRank(app);
    if (rank >= 1) respondedCount += 1;
    if (rank >= 2) interviewCount += 1;
    if (rank >= 3) offerCount += 1;
  }

  const respRate = total ? Math.round((respondedCount / total) * 100) : 0;

  return { total, respondedCount, interviewCount, offerCount, respRate };
}

export function appEventLabel(type: string): string {
  if (type === "interview") return "Interview";
  if (type === "followup") return "Follow-up";
  return "Reminder";
}

export function eventDotColor(type: string): string {
  if (type === "interview") return "#9A6212";
  if (type === "followup") return "#2F6BFF";
  return "#8A92A0";
}

export function formatAppDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDay(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fitScoreStyle(score: number | null | undefined): {
  fg: string;
  bg: string;
  bd: string;
} {
  const n = Number(score);
  if (Number.isNaN(n)) {
    return { fg: "#8A92A0", bg: "#F2F3F5", bd: "#E2E5EA" };
  }
  if (n >= 75) return { fg: "#0E7C4B", bg: "#E6F7EE", bd: "#BFE8D1" };
  if (n >= 50) return { fg: "#9A6212", bg: "#FEF3DA", bd: "#F1DDA6" };
  return { fg: "#B23B3B", bg: "#FCECEC", bd: "#F2D2D2" };
}

export function applicationTags(app: Application): string[] {
  const tags = [`Resume: ${app.resume_version_name ?? "Unknown"}`];
  if (app.cover_letter?.trim()) tags.push("Cover letter");
  if (app.answers?.length) tags.push(`${app.answers.length} Q&A`);
  return tags;
}

/** Parse tailored version names like "VP of Growth · Acme Health". */
export function parseJobFromVersionName(name: string): {
  role: string;
  company: string;
} {
  const trimmed = name.trim();
  const sep = trimmed.indexOf(" · ");
  if (sep === -1) return { role: "", company: "" };
  return {
    role: trimmed.slice(0, sep).trim(),
    company: trimmed.slice(sep + 3).trim(),
  };
}

export function applicationListHeading(app: Application): {
  primary: string;
  secondary: string | null;
} {
  const role = app.role?.trim() ?? "";
  const company = app.company?.trim() ?? "";

  if (role && company) return { primary: role, secondary: company };
  if (role) return { primary: role, secondary: null };
  if (company) return { primary: company, secondary: null };
  return { primary: "Untitled application", secondary: null };
}

export function applicationDetailTitle(app: Application): string {
  const role = app.role?.trim() ?? "";
  const company = app.company?.trim() ?? "";

  if (role && company) return `${role} · ${company}`;
  if (role) return role;
  if (company) return company;
  return "Untitled application";
}

export function applicationInsightsTitle(app: Application): string {
  return applicationDetailTitle(app);
}

export function normalizeCompanyKey(company: string): string {
  return company.trim().toLowerCase().replace(/\s+/g, " ");
}

export function appliedDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function appliedDateFromInput(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function nextOpenEvent(events: ApplicationEvent[]): ApplicationEvent | null {
  return (
    events
      .filter((e) => !e.done && e.date)
      .slice()
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))[0] ?? null
  );
}

export function normalizeResumeSnapshot(raw: unknown): Application["resume_snapshot"] {
  const o = (raw ?? {}) as Record<string, unknown>;
  const data = (o.data ?? {}) as Application["resume_snapshot"]["data"];
  return {
    name: String(o.name ?? ""),
    template_style: (o.template_style as Application["resume_snapshot"]["template_style"]) ?? "twocol",
    data: {
      name: String(data.name ?? ""),
      headline: String(data.headline ?? ""),
      phone: String(data.phone ?? ""),
      email: String(data.email ?? ""),
      location: String(data.location ?? ""),
      linkedin: String(data.linkedin ?? ""),
      summary: String(data.summary ?? ""),
      skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
      experience: Array.isArray(data.experience)
        ? data.experience.map((e) => ({
            company: String(e.company ?? ""),
            title: String(e.title ?? ""),
            dates: String(e.dates ?? ""),
            blurb: String(e.blurb ?? ""),
            bullets: Array.isArray(e.bullets) ? e.bullets.map(String) : [],
          }))
        : [],
      education: Array.isArray(data.education)
        ? data.education.map((ed) => ({
            school: String(ed.school ?? ""),
            degree: String(ed.degree ?? ""),
            year: String(ed.year ?? ""),
          }))
        : [],
    },
  };
}
