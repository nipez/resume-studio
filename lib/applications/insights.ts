import type { Application, ApplicationStatus } from "@/lib/applications/types";
import {
  applicationInsightsTitle,
  applicationPeakRank,
  computeApplicationStats,
  todayISO,
} from "@/lib/applications/utils";

export type FunnelStage = {
  key: string;
  label: string;
  count: number;
  pctOfTotal: number;
};

export type VersionPerformance = {
  versionId: string | null;
  name: string;
  sent: number;
  responded: number;
  interviewed: number;
  offers: number;
  respRate: number;
};

export type UpcomingEvent = {
  id: string;
  date: string;
  type: string;
  title: string;
  appId: string;
  appTitle: string;
  company: string;
  overdue: boolean;
};

export type InsightsData = {
  stats: ReturnType<typeof computeApplicationStats>;
  interviewRate: number;
  offerRate: number;
  funnel: FunnelStage[];
  statusCounts: { status: ApplicationStatus; count: number }[];
  versions: VersionPerformance[];
  upcoming: UpcomingEvent[];
  hasData: boolean;
};

export function computeInsights(apps: Application[]): InsightsData {
  const stats = computeApplicationStats(apps);
  const total = stats.total;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  let responded = 0;
  let interviewed = 0;
  let offers = 0;
  for (const app of apps) {
    const rank = applicationPeakRank(app);
    if (rank >= 1) responded += 1;
    if (rank >= 2) interviewed += 1;
    if (rank >= 3) offers += 1;
  }

  const funnel: FunnelStage[] = [
    { key: "applied", label: "Applied", count: total, pctOfTotal: 100 },
    {
      key: "response",
      label: "Responses",
      count: responded,
      pctOfTotal: pct(responded),
    },
    {
      key: "interview",
      label: "Interviews",
      count: interviewed,
      pctOfTotal: pct(interviewed),
    },
    { key: "offer", label: "Offers", count: offers, pctOfTotal: pct(offers) },
  ];

  const statusOrder: ApplicationStatus[] = [
    "applied",
    "response",
    "interview",
    "offer",
    "rejected",
    "ghosted",
  ];
  const counts: Record<string, number> = {};
  for (const app of apps) counts[app.status] = (counts[app.status] ?? 0) + 1;
  const statusCounts = statusOrder
    .map((status) => ({ status, count: counts[status] ?? 0 }))
    .filter((entry) => entry.count > 0);

  const versionMap = new Map<string, VersionPerformance>();
  for (const app of apps) {
    const key = app.resume_version_id ?? `name:${app.resume_version_name ?? "Unknown"}`;
    const name =
      app.resume_version_name || app.resume_snapshot?.name || "Unknown version";
    let perf = versionMap.get(key);
    if (!perf) {
      perf = {
        versionId: app.resume_version_id,
        name,
        sent: 0,
        responded: 0,
        interviewed: 0,
        offers: 0,
        respRate: 0,
      };
      versionMap.set(key, perf);
    }
    perf.sent += 1;
    const rank = applicationPeakRank(app);
    if (rank >= 1) perf.responded += 1;
    if (rank >= 2) perf.interviewed += 1;
    if (rank >= 3) perf.offers += 1;
  }
  const versions = Array.from(versionMap.values())
    .map((perf) => ({
      ...perf,
      respRate: perf.sent ? Math.round((perf.responded / perf.sent) * 100) : 0,
    }))
    .sort((a, b) => b.sent - a.sent || b.respRate - a.respRate);

  const today = todayISO();
  const upcoming: UpcomingEvent[] = [];
  for (const app of apps) {
    for (const event of app.events ?? []) {
      if (event.done || !event.date) continue;
      upcoming.push({
        id: event.id,
        date: event.date,
        type: event.type,
        title: event.title,
        appId: app.id,
        appTitle: applicationInsightsTitle(app),
        company: app.company,
        overdue: event.date < today,
      });
    }
  }
  upcoming.sort((a, b) => a.date.localeCompare(b.date));

  return {
    stats,
    interviewRate: pct(interviewed),
    offerRate: pct(offers),
    funnel,
    statusCounts,
    versions,
    upcoming: upcoming.slice(0, 8),
    hasData: total > 0,
  };
}
