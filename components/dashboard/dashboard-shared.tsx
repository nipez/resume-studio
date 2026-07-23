import Link from "next/link";
import type { SuggestedFollowUp } from "@/lib/applications/insights";
import { appEventLabel, formatDay } from "@/lib/applications/utils";
import { buildHrefForPersona } from "@/lib/profile/persona";
import type { ResumeVersion } from "@/lib/resume/db-types";

export type DashboardStat = { label: string; value: string };

export type DashboardUpcoming = {
  id: string;
  date: string;
  type: string;
  appId: string;
  appTitle: string;
  company: string;
  overdue: boolean;
};

export type DashboardDocPreview = {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  tailoredLabel: string | null;
};

export type DashboardSavedJobPreview = {
  id: string;
  role: string;
  company: string;
};

export type DashboardAppPreview = {
  id: string;
  role: string;
  company: string;
  status: string;
  appliedAt: string;
  hasPrep: boolean;
};

export type DashboardHomeData = {
  firstName: string;
  persona: "student" | "professional" | null;
  onboardingPersonaSet: boolean;
  isStudent: boolean;
  versionsCount: number;
  applicationsCount: number;
  hasTailored: boolean;
  primaryVersionId: string | null;
  versions: ResumeVersion[];
  versionCounts: Record<string, number>;
  stats: { respRate: number; interviewRate: number; offers: number };
  upcoming: DashboardUpcoming[];
  suggestedFollowUps: SuggestedFollowUp[];
  recentVersions: DashboardDocPreview[];
  savedJobs: DashboardSavedJobPreview[];
  prepCandidates: DashboardAppPreview[];
};

export const DASHBOARD_VIEW_STORAGE_KEY = "resumetrakr-dashboard-view";

export type DashboardView = "simple" | "full";

export function buildHref(isStudent: boolean) {
  return buildHrefForPersona(isStudent);
}

export const MODULES = [
  { n: "01", title: "Library", body: "Keep a master resume and tailored cuts." },
  { n: "02", title: "Tailor", body: "Match a version to a job description." },
  { n: "03", title: "Cover", body: "Generate a letter in your voice." },
  { n: "04", title: "Q&A", body: "Answer application questions fast." },
  { n: "05", title: "Track", body: "Log every send with a snapshot." },
  { n: "06", title: "Insights", body: "See what's actually working." },
];

export function StatCard({ label, value }: DashboardStat) {
  return (
    <div className="rounded-2xl border border-border bg-white px-5 py-4">
      <div className="font-display text-[26px] font-semibold leading-none tracking-[-0.03em] text-ink">
        {value}
      </div>
      <div className="mt-2 text-[12px] font-medium text-muted">{label}</div>
    </div>
  );
}

export function UpcomingSection({ upcoming }: { upcoming: DashboardUpcoming[] }) {
  if (upcoming.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h2 className="mb-3 text-[15px] font-semibold text-ink">Upcoming</h2>
      <div className="space-y-1.5">
        {upcoming.map((event) => (
          <Link
            key={event.id}
            href={`/applications/${event.appId}`}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-soft"
          >
            <div
              className={`flex-none rounded-md px-2 py-1 text-[11px] font-bold ${
                event.overdue
                  ? "bg-[#FCECEC] text-[#B23B3B]"
                  : "bg-[#E8FBF8] text-teal-dark"
              }`}
            >
              {formatDay(event.date)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink">
                {appEventLabel(event.type)}
                {event.overdue ? (
                  <span className="ml-1.5 text-[11px] font-semibold text-[#B23B3B]">
                    overdue
                  </span>
                ) : null}
              </div>
              <div className="truncate text-[12px] text-muted">
                {event.appTitle}
                {event.company ? ` · ${event.company}` : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export type ChecklistItem = {
  label: string;
  done: boolean;
  href: string;
  cta: string;
};

export function ChecklistSection({
  title,
  subtitle,
  items,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  items: ChecklistItem[];
  compact?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-white ${
        compact ? "p-5" : "p-6"
      }`}
    >
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
      {subtitle ? (
        <p className="mt-1 mb-4 text-[12.5px] text-muted">{subtitle}</p>
      ) : (
        <div className="mb-3" />
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-soft"
          >
            <span
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold ${
                item.done
                  ? "bg-[#E6F7EE] text-[#0E7C4B]"
                  : "bg-[#F0ECFF] text-accent"
              }`}
            >
              {item.done ? "✓" : "+"}
            </span>
            <span
              className={`flex-1 text-[13.5px] ${
                item.done ? "text-[#9AA3AF] line-through" : "font-medium text-ink"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function formatShortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
