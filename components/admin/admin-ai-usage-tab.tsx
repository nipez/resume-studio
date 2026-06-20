"use client";

import {
  formatActionLabel,
  formatUsdCost,
  type AdminAIUsageDashboard,
} from "@/lib/admin/ai-usage-types";
import { formatAdminDate } from "@/lib/admin/types";

type AdminAIUsageTabProps = {
  data: AdminAIUsageDashboard;
};

function formatDayLabel(dateKey: string) {
  try {
    return new Date(`${dateKey}T12:00:00.000Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateKey;
  }
}

function formatMonthLabel(periodStart: string) {
  try {
    return new Date(`${periodStart.slice(0, 10)}T12:00:00.000Z`).toLocaleDateString(
      undefined,
      { month: "short", year: "numeric" }
    );
  } catch {
    return periodStart;
  }
}

export function AdminAIUsageTab({ data }: AdminAIUsageTabProps) {
  if (!data.available) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-6 py-12 text-center">
        <div className="font-display text-[15px] font-semibold text-muted">
          AI usage tracking not available
        </div>
        <p className="mx-auto mt-2 max-w-[480px] text-[13.5px] text-muted">
          Run migration{" "}
          <code className="rounded bg-[#F2F3F5] px-1.5 py-0.5 text-[12px]">
            0011_ai_usage.sql
          </code>{" "}
          in Supabase. Costs are recorded automatically on each AI call via{" "}
          <code className="rounded bg-[#F2F3F5] px-1.5 py-0.5 text-[12px]">
            ai_usage_events
          </code>
          .
        </p>
      </div>
    );
  }

  const maxDailyCost = Math.max(
    ...data.dailyLast30Days.map((d) => d.costUsd),
    0.000_001
  );

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="font-display text-[15px] font-semibold text-ink">
          Anthropic API costs (estimated)
        </h2>
        <p className="mt-1 max-w-[640px] text-[13px] leading-relaxed text-muted">
          Token-based estimates from{" "}
          <code className="rounded bg-[#F2F3F5] px-1 py-0.5 text-[11px]">
            lib/ai/cost.ts
          </code>
          — useful for pricing margin, not exact billing. Compare with the Anthropic
          dashboard periodically.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Today" value={formatUsdCost(data.costTodayUsd)} meta={`${data.actionsToday} actions`} />
          <MetricCard label="Last 7 days" value={formatUsdCost(data.costLast7DaysUsd)} />
          <MetricCard
            label="Month to date"
            value={formatUsdCost(data.costMonthToDateUsd)}
            meta={`${data.actionsMonthToDate} actions`}
          />
          <MetricCard
            label="All time (365d)"
            value={formatUsdCost(data.costAllTimeUsd)}
            meta={`${data.actionsAllTime} events logged`}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-display text-[14px] font-semibold text-ink">
            Daily cost — last 30 days
          </h3>
          <div className="mt-4 flex h-[160px] items-end gap-[3px]">
            {data.dailyLast30Days.map((point) => {
              const heightPct = Math.max(
                4,
                Math.round((point.costUsd / maxDailyCost) * 100)
              );
              const hasCost = point.costUsd > 0;
              return (
                <div
                  key={point.date}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  title={`${point.date}: ${formatUsdCost(point.costUsd)} (${point.actionCount} actions)`}
                >
                  <div
                    className={`w-full rounded-t-[3px] ${
                      hasCost ? "bg-accent" : "bg-[#EEF0F3]"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>{formatDayLabel(data.dailyLast30Days[0]?.date ?? "")}</span>
            <span>Today</span>
          </div>

          <div className="mt-5 max-h-[220px] overflow-auto rounded-xl border border-[#EEF0F3]">
            <table className="w-full text-left text-[12.5px]">
              <thead className="sticky top-0 bg-[#FAFBFC] text-[11px] font-bold uppercase tracking-wide text-[#8A92A0]">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Actions</th>
                  <th className="px-3 py-2 text-right">Est. cost</th>
                </tr>
              </thead>
              <tbody>
                {[...data.dailyLast30Days].reverse().map((point) => (
                  <tr key={point.date} className="border-t border-[#F2F3F5]">
                    <td className="px-3 py-2 text-ink">{formatDayLabel(point.date)}</td>
                    <td className="px-3 py-2 text-muted">{point.actionCount}</td>
                    <td className="px-3 py-2 text-right font-semibold text-ink">
                      {formatUsdCost(point.costUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-white p-6">
          <h3 className="font-display text-[14px] font-semibold text-ink">
            Monthly history
          </h3>
          {data.monthlyHistory.length === 0 ? (
            <p className="mt-3 text-[13px] text-muted">No monthly rollups yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {data.monthlyHistory.map((month) => (
                <div
                  key={month.periodStart}
                  className="flex items-center justify-between rounded-xl border border-[#EEF0F3] px-3.5 py-2.5"
                >
                  <div>
                    <div className="text-[13px] font-semibold text-ink">
                      {formatMonthLabel(month.periodStart)}
                    </div>
                    <div className="text-[11.5px] text-muted">
                      {month.actionCount} actions · {month.activeUsers} users
                    </div>
                  </div>
                  <div className="font-display text-[15px] font-semibold text-ink">
                    {formatUsdCost(month.costUsd)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="mt-6 font-display text-[14px] font-semibold text-ink">
            Top users this month
          </h3>
          {data.topUsersThisMonth.length === 0 ? (
            <p className="mt-3 text-[13px] text-muted">No AI usage this month yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {data.topUsersThisMonth.map((row) => (
                <div
                  key={row.userId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#EEF0F3] px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-ink">
                      {row.fullName || row.email}
                    </div>
                    <div className="truncate text-[11.5px] text-muted">
                      {row.actionCount} actions
                    </div>
                  </div>
                  <div className="flex-none font-semibold text-ink">
                    {formatUsdCost(row.costUsd)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="border-b border-[#EEF0F3] px-6 py-4">
          <h3 className="font-display text-[14px] font-semibold text-ink">
            Recent AI calls
          </h3>
        </div>
        <div className="hidden grid-cols-[minmax(140px,1fr)_120px_100px_90px_140px] gap-3 border-b border-[#EEF0F3] bg-[#FAFBFC] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0] lg:grid">
          <div>User</div>
          <div>Action</div>
          <div>Model</div>
          <div className="text-right">Cost</div>
          <div>When</div>
        </div>
        {data.recentEvents.length === 0 ? (
          <div className="px-6 py-10 text-center text-[13px] text-muted">
            No AI events recorded yet.
          </div>
        ) : (
          data.recentEvents.map((event) => (
            <div
              key={event.id}
              className="border-b border-[#F2F3F5] px-6 py-3.5 last:border-b-0 lg:grid lg:grid-cols-[minmax(140px,1fr)_120px_100px_90px_140px] lg:items-center lg:gap-3"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-ink">
                  {event.fullName || event.email}
                </div>
                <div className="truncate text-[11px] text-muted">{event.email}</div>
              </div>
              <div className="mt-1 capitalize text-[12.5px] text-ink lg:mt-0">
                {formatActionLabel(event.action)}
              </div>
              <div className="mt-1 truncate text-[11.5px] text-muted lg:mt-0">
                {event.model}
              </div>
              <div className="mt-1 text-[13px] font-semibold text-ink lg:mt-0 lg:text-right">
                {formatUsdCost(event.costUsd)}
              </div>
              <div
                className="mt-1 text-[12px] text-muted lg:mt-0"
                title={formatAdminDate(event.createdAt)}
              >
                {formatAdminDate(event.createdAt)}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#E4E7EC] bg-[#FAFBFC] px-[16px] py-3.5">
      <div className="font-display text-[22px] font-semibold leading-none text-ink">
        {value}
      </div>
      <div className="mt-1.5 text-xs font-semibold text-muted">{label}</div>
      {meta ? <div className="mt-0.5 text-[10.5px] text-[#9AA3AF]">{meta}</div> : null}
    </div>
  );
}
