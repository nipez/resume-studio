import Link from "next/link";
import type { SuggestedFollowUp } from "@/lib/applications/insights";
import { appEventLabel, formatDay } from "@/lib/applications/utils";

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

export type DashboardHomeData = {
  firstName: string;
  persona: "student" | "professional" | null;
  onboardingPersonaSet: boolean;
  isStudent: boolean;
  versionsCount: number;
  applicationsCount: number;
  hasTailored: boolean;
  primaryVersionId: string | null;
  stats: { respRate: number; interviewRate: number; offers: number };
  upcoming: DashboardUpcoming[];
  suggestedFollowUps: SuggestedFollowUp[];
};

export const DASHBOARD_VIEW_STORAGE_KEY = "resumetrakr-dashboard-view";

export type DashboardView = "simple" | "full";

import { buildHrefForPersona } from "@/lib/profile/persona";

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
    <div className="rounded-[14px] border border-border bg-white px-[18px] py-4">
      <div className="font-display text-[24px] font-semibold leading-none text-ink">
        {value}
      </div>
      <div className="mt-1.5 text-xs font-semibold text-muted">{label}</div>
    </div>
  );
}

export function UpcomingSection({ upcoming }: { upcoming: DashboardUpcoming[] }) {
  if (upcoming.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-white p-6">
      <h2 className="mb-3 font-display text-[15px] font-semibold text-ink">
        Upcoming
      </h2>
      <div className="space-y-2">
        {upcoming.map((event) => (
          <Link
            key={event.id}
            href={`/applications/${event.appId}`}
            className="flex items-center gap-3 rounded-xl border border-[#EEF0F3] px-3.5 py-2.5 transition-colors hover:border-[#D9DEE5] hover:bg-[#FAFBFC]"
          >
            <div
              className={`flex-none rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                event.overdue
                  ? "bg-[#FCECEC] text-[#B23B3B]"
                  : "bg-[#EAF1FF] text-[#1E54E6]"
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
}: {
  title: string;
  subtitle: string;
  items: ChecklistItem[];
}) {
  const doneCount = items.filter((c) => c.done).length;

  return (
    <section className="rounded-2xl border border-border bg-white p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
        <span className="text-[12.5px] font-semibold text-muted">
          {doneCount}/{items.length} done
        </span>
      </div>
      <p className="mb-4 text-[12.5px] text-muted">{subtitle}</p>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl border border-[#EEF0F3] px-3.5 py-2.5"
          >
            <span
              className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold ${
                item.done
                  ? "bg-[#E6F7EE] text-[#0E7C4B]"
                  : "border border-[#D2D7DE] text-transparent"
              }`}
            >
              ✓
            </span>
            <span
              className={`flex-1 text-[13.5px] ${
                item.done ? "text-[#8A92A0] line-through" : "font-medium text-ink"
              }`}
            >
              {item.label}
            </span>
            {!item.done ? (
              <Link
                href={item.href}
                className="flex-none rounded-lg bg-accent px-3 py-[6px] text-[12px] font-semibold text-white hover:bg-[#1E54E6]"
              >
                {item.cta}
              </Link>
            ) : (
              <Link
                href={item.href}
                className="flex-none rounded-lg border border-[#E0E3E8] bg-white px-3 py-[6px] text-[12px] font-semibold text-[#5A6573] hover:border-[#C8CED6]"
              >
                {item.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
