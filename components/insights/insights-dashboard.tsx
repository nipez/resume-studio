import type { InsightsData } from "@/lib/applications/insights";
import { appEventLabel, appStatusMeta, formatDay } from "@/lib/applications/utils";
import Link from "next/link";

const FUNNEL_STATUS: Record<string, "applied" | "response" | "interview" | "offer"> =
  {
    applied: "applied",
    response: "response",
    interview: "interview",
    offer: "offer",
  };

function KpiCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: ReturnType<typeof appStatusMeta>;
}) {
  if (tone) {
    return (
      <div
        className="min-w-[140px] flex-1 rounded-[14px] border px-[18px] py-4"
        style={{ background: tone.bg, color: tone.fg, borderColor: tone.bd }}
      >
        <div className="font-display text-[26px] font-semibold leading-none">
          {value}
        </div>
        <div className="mt-1.5 text-xs font-semibold opacity-85">{label}</div>
      </div>
    );
  }
  return (
    <div className="min-w-[140px] flex-1 rounded-[14px] bg-sidebar px-[18px] py-4 text-white">
      <div className="font-display text-[26px] font-semibold leading-none">
        {value}
      </div>
      <div className="mt-1.5 text-xs font-semibold opacity-85">{label}</div>
    </div>
  );
}

export function InsightsDashboard({ data }: { data: InsightsData }) {
  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1080px] px-12 pb-16 pt-[42px]">
        <div className="mb-[26px]">
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
            Insights
          </h1>
          <p className="mt-2 max-w-[620px] text-[14.5px] leading-relaxed text-muted">
            Your pipeline funnel, what each resume version is actually getting,
            and what&apos;s coming up — based on each application&apos;s current
            status.
          </p>
        </div>

        {!data.hasData ? (
          <div className="rounded-2xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-7 py-12 text-center text-[#8A92A0]">
            <div className="mb-2.5 text-[32px] opacity-55">📊</div>
            <div className="font-display text-[15px] font-semibold text-muted">
              No insights yet
            </div>
            <div className="mt-1.5 text-[13px]">
              Log an application from your{" "}
              <Link href="/library" className="font-semibold text-accent">
                Library
              </Link>{" "}
              or the{" "}
              <Link href="/applications" className="font-semibold text-accent">
                Applications
              </Link>{" "}
              tab. As you update statuses, your funnel and version performance
              show up here.
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap gap-3">
              <KpiCard label="Applications" value={String(data.stats.total)} />
              <KpiCard
                label="Response rate"
                value={`${data.stats.respRate}%`}
                tone={appStatusMeta("response")}
              />
              <KpiCard
                label="Interview rate"
                value={`${data.interviewRate}%`}
                tone={appStatusMeta("interview")}
              />
              <KpiCard
                label="Offers"
                value={String(data.stats.offerCount)}
                tone={appStatusMeta("offer")}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
              <section className="rounded-2xl border border-border bg-white p-6">
                <h2 className="font-display text-[15px] font-semibold text-ink">
                  Pipeline funnel
                </h2>
                <p className="mt-1 text-[12.5px] text-muted">
                  How far your applications are right now, by current status.
                </p>
                <div className="mt-5 space-y-4">
                  {data.funnel.map((stage) => {
                    const meta = appStatusMeta(FUNNEL_STATUS[stage.key]);
                    return (
                      <div key={stage.key}>
                        <div className="mb-1.5 flex items-baseline justify-between">
                          <span className="text-[13px] font-semibold text-[#3a4350]">
                            {stage.label}
                          </span>
                          <span className="text-[12.5px] text-muted">
                            <span className="font-semibold text-ink">
                              {stage.count}
                            </span>{" "}
                            · {stage.pctOfTotal}%
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-[#F0F2F5]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(stage.pctOfTotal, stage.count > 0 ? 3 : 0)}%`,
                              background: meta.fg,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {data.statusCounts.length > 0 ? (
                  <div className="mt-6 border-t border-[#EEF0F3] pt-4">
                    <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
                      By current status
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.statusCounts.map((entry) => {
                        const meta = appStatusMeta(entry.status);
                        return (
                          <span
                            key={entry.status}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-semibold"
                            style={{
                              background: meta.bg,
                              color: meta.fg,
                              borderColor: meta.bd,
                            }}
                          >
                            {meta.label}
                            <span className="opacity-80">{entry.count}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="rounded-2xl border border-border bg-white p-6">
                <h2 className="font-display text-[15px] font-semibold text-ink">
                  Upcoming
                </h2>
                <p className="mt-1 text-[12.5px] text-muted">
                  Open interviews, follow-ups, and reminders.
                </p>
                <div className="mt-4 space-y-2.5">
                  {data.upcoming.length > 0 ? (
                    data.upcoming.map((event) => (
                      <Link
                        key={event.id}
                        href={`/applications/${event.appId}`}
                        className="flex items-center gap-3 rounded-xl border border-[#EEF0F3] px-3.5 py-2.5 transition-colors hover:border-[#D9DEE5] hover:bg-[#FAFBFC]"
                      >
                        <div
                          className={`flex-none rounded-lg px-2.5 py-1 text-center text-[11px] font-bold ${
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
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#E2E5EA] bg-[#FBFBFC] px-4 py-6 text-center text-[12.5px] text-muted">
                      Nothing scheduled. Add follow-ups or interviews from an
                      application&apos;s detail page.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-white">
              <div className="border-b border-[#EEF0F3] px-6 py-4">
                <h2 className="font-display text-[15px] font-semibold text-ink">
                  Resume version performance
                </h2>
                <p className="mt-1 text-[12.5px] text-muted">
                  Which cuts of your resume actually earn responses and
                  interviews.
                </p>
              </div>
              <div className="grid grid-cols-[1fr_70px_90px_90px_70px_90px] gap-3 border-b border-[#EEF0F3] bg-[#FAFBFC] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
                <div>Version</div>
                <div className="text-right">Sent</div>
                <div className="text-right">Responses</div>
                <div className="text-right">Interviews</div>
                <div className="text-right">Offers</div>
                <div className="text-right">Resp rate</div>
              </div>
              {data.versions.map((version) => (
                <div
                  key={version.versionId ?? version.name}
                  className="grid grid-cols-[1fr_70px_90px_90px_70px_90px] items-center gap-3 border-b border-[#F2F3F5] px-6 py-3 text-[13px] last:border-b-0"
                >
                  <div className="truncate font-semibold text-[#141821]">
                    {version.name}
                  </div>
                  <div className="text-right text-[#3a4350]">{version.sent}</div>
                  <div className="text-right text-[#3a4350]">
                    {version.responded}
                  </div>
                  <div className="text-right text-[#3a4350]">
                    {version.interviewed}
                  </div>
                  <div className="text-right text-[#3a4350]">
                    {version.offers}
                  </div>
                  <div className="text-right font-semibold text-ink">
                    {version.respRate}%
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
