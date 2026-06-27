"use server";

import { isAdminUser } from "@/lib/auth/admin";
import type {
  AdminAIRecentEvent,
  AdminAIUsageDashboard,
  AdminAIDailyPoint,
  AdminAIMonthlyPoint,
  AdminAIUserCostRow,
} from "@/lib/admin/ai-usage-types";
import { getAuthedDb } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

type UsageEventRow = {
  id: string;
  user_id: string;
  action: string;
  model: string;
  estimated_cost_usd: number | string;
  created_at: string;
};

type MonthlyRow = {
  user_id: string;
  period_start: string;
  action_count: number;
  estimated_cost_usd: number | string;
};

function utcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthStartKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function isMissingAiUsageTable(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("ai_usage_events") &&
    (lower.includes("does not exist") ||
      lower.includes("could not find") ||
      lower.includes("schema cache"))
  );
}

async function requireAdmin() {
  const authed = await getAuthedDb();
  if (!isAdminUser({ email: authed.email })) throw new Error("Not authorized");
}

async function fetchAllUsageEvents(svc: ReturnType<typeof createServiceClient>) {
  const rows: UsageEventRow[] = [];
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 365);

  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await svc
      .from("ai_usage_events")
      .select("id, user_id, action, model, estimated_cost_usd, created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    const batch = (data ?? []) as UsageEventRow[];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
    if (from > 20_000) break;
  }

  return rows;
}

async function fetchMonthlyRows(svc: ReturnType<typeof createServiceClient>) {
  const { data, error } = await svc
    .from("ai_usage_monthly")
    .select("user_id, period_start, action_count, estimated_cost_usd")
    .order("period_start", { ascending: false });

  if (error) throw error;
  return (data ?? []) as MonthlyRow[];
}

async function resolveUserLabels(
  svc: ReturnType<typeof createServiceClient>,
  userIds: string[]
) {
  const emailById = new Map<string, string>();
  const nameById = new Map<string, string | null>();

  if (userIds.length === 0) {
    return { emailById, nameById };
  }

  const { data: profiles } = await svc
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  for (const profile of profiles ?? []) {
    nameById.set(profile.id, profile.full_name ?? null);
  }

  await Promise.all(
    userIds.map(async (id) => {
      const { data } = await svc.auth.admin.getUserById(id);
      emailById.set(id, data.user?.email ?? "unknown");
    })
  );

  return { emailById, nameById };
}

function emptyDashboard(): AdminAIUsageDashboard {
  return {
    available: false,
    costTodayUsd: 0,
    costLast7DaysUsd: 0,
    costMonthToDateUsd: 0,
    costAllTimeUsd: 0,
    actionsToday: 0,
    actionsMonthToDate: 0,
    actionsAllTime: 0,
    dailyLast30Days: [],
    monthlyHistory: [],
    topUsersThisMonth: [],
    recentEvents: [],
  };
}

export async function getAdminAIUsageDashboard(): Promise<AdminAIUsageDashboard> {
  await requireAdmin();
  const svc = createServiceClient();

  let events: UsageEventRow[] = [];
  let monthlyRows: MonthlyRow[] = [];

  try {
    [events, monthlyRows] = await Promise.all([
      fetchAllUsageEvents(svc),
      fetchMonthlyRows(svc),
    ]);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (isMissingAiUsageTable(message)) {
      return emptyDashboard();
    }
    throw e;
  }

  const now = new Date();
  const todayKey = utcDateKey(now);
  const monthKey = monthStartKey(now);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  const sevenDayKey = utcDateKey(sevenDaysAgo);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);
  const thirtyDayKey = utcDateKey(thirtyDaysAgo);

  let costTodayUsd = 0;
  let costLast7DaysUsd = 0;
  let costMonthToDateUsd = 0;
  let costAllTimeUsd = 0;
  let actionsToday = 0;
  let actionsMonthToDate = 0;

  const dailyMap = new Map<string, { costUsd: number; actionCount: number }>();
  const userMonthMap = new Map<string, { costUsd: number; actionCount: number }>();

  for (const event of events) {
    const cost = Number(event.estimated_cost_usd) || 0;
    const dayKey = event.created_at.slice(0, 10);

    costAllTimeUsd += cost;

    if (dayKey === todayKey) {
      costTodayUsd += cost;
      actionsToday += 1;
    }

    if (dayKey >= sevenDayKey) {
      costLast7DaysUsd += cost;
    }

    if (dayKey >= monthKey) {
      costMonthToDateUsd += cost;
      actionsMonthToDate += 1;

      const userTotals = userMonthMap.get(event.user_id) ?? {
        costUsd: 0,
        actionCount: 0,
      };
      userTotals.costUsd += cost;
      userTotals.actionCount += 1;
      userMonthMap.set(event.user_id, userTotals);
    }

    if (dayKey >= thirtyDayKey) {
      const daily = dailyMap.get(dayKey) ?? { costUsd: 0, actionCount: 0 };
      daily.costUsd += cost;
      daily.actionCount += 1;
      dailyMap.set(dayKey, daily);
    }
  }

  const dailyLast30Days: AdminAIDailyPoint[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const key = utcDateKey(d);
    const point = dailyMap.get(key) ?? { costUsd: 0, actionCount: 0 };
    dailyLast30Days.push({
      date: key,
      costUsd: point.costUsd,
      actionCount: point.actionCount,
    });
  }

  const monthlyAggregate = new Map<
    string,
    { costUsd: number; actionCount: number; users: Set<string> }
  >();

  for (const row of monthlyRows) {
    const period = String(row.period_start).slice(0, 10);
    const bucket = monthlyAggregate.get(period) ?? {
      costUsd: 0,
      actionCount: 0,
      users: new Set<string>(),
    };
    bucket.costUsd += Number(row.estimated_cost_usd) || 0;
    bucket.actionCount += row.action_count ?? 0;
    bucket.users.add(row.user_id);
    monthlyAggregate.set(period, bucket);
  }

  const monthlyHistory: AdminAIMonthlyPoint[] = Array.from(monthlyAggregate.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 12)
    .map(([periodStart, bucket]) => ({
      periodStart,
      costUsd: bucket.costUsd,
      actionCount: bucket.actionCount,
      activeUsers: bucket.users.size,
    }));

  const topUserIds = Array.from(userMonthMap.entries())
    .sort((a, b) => b[1].costUsd - a[1].costUsd)
    .slice(0, 10)
    .map(([userId]) => userId);

  const recentUserIds = Array.from(
    new Set(events.slice(0, 25).map((e) => e.user_id))
  );

  const labelIds = Array.from(new Set(topUserIds.concat(recentUserIds)));
  const { emailById, nameById } = await resolveUserLabels(svc, labelIds);

  const topUsersThisMonth: AdminAIUserCostRow[] = topUserIds.map((userId) => {
    const totals = userMonthMap.get(userId)!;
    return {
      userId,
      email: emailById.get(userId) ?? "unknown",
      fullName: nameById.get(userId) ?? null,
      costUsd: totals.costUsd,
      actionCount: totals.actionCount,
    };
  });

  const recentEvents: AdminAIRecentEvent[] = events.slice(0, 30).map((event) => ({
    id: event.id,
    userId: event.user_id,
    email: emailById.get(event.user_id) ?? "unknown",
    fullName: nameById.get(event.user_id) ?? null,
    action: event.action,
    model: event.model,
    costUsd: Number(event.estimated_cost_usd) || 0,
    createdAt: event.created_at,
  }));

  return {
    available: true,
    costTodayUsd,
    costLast7DaysUsd,
    costMonthToDateUsd,
    costAllTimeUsd,
    actionsToday,
    actionsMonthToDate,
    actionsAllTime: events.length,
    dailyLast30Days,
    monthlyHistory,
    topUsersThisMonth,
    recentEvents,
  };
}
