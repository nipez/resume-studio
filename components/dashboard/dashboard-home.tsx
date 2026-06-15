import Link from "next/link";
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

type DashboardHomeProps = {
  firstName: string;
  isStudent: boolean;
  versionsCount: number;
  applicationsCount: number;
  hasTailored: boolean;
  primaryVersionId: string | null;
  stats: { respRate: number; interviewRate: number; offers: number };
  upcoming: DashboardUpcoming[];
};

const MODULES = [
  { n: "01", title: "Library", body: "Keep a master resume and tailored cuts." },
  { n: "02", title: "Tailor", body: "Match a version to a job description." },
  { n: "03", title: "Cover", body: "Generate a letter in your voice." },
  { n: "04", title: "Q&A", body: "Answer application questions fast." },
  { n: "05", title: "Track", body: "Log every send with a snapshot." },
  { n: "06", title: "Insights", body: "See what's actually working." },
];

export function DashboardHome({
  firstName,
  isStudent,
  versionsCount,
  applicationsCount,
  hasTailored,
  primaryVersionId,
  stats,
  upcoming,
}: DashboardHomeProps) {
  const buildHref = isStudent ? "/build?mode=student" : "/build";
  const isNew = versionsCount === 0;

  const checklist = [
    {
      label: "Create your first resume",
      done: versionsCount > 0,
      href: versionsCount > 0 && primaryVersionId ? `/editor/${primaryVersionId}` : buildHref,
      cta: versionsCount > 0 ? "Open editor" : "Build now",
    },
    {
      label: "Tailor a version to a job",
      done: hasTailored,
      href: "/tailor",
      cta: "Tailor",
    },
    {
      label: "Log your first application",
      done: applicationsCount > 0,
      href: "/applications",
      cta: "Log it",
    },
    {
      label: "See what's working in Insights",
      done: applicationsCount > 0,
      href: "/insights",
      cta: "View",
    },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  const quickActions = [
    { label: "Build step by step", desc: "Guided resume builder", href: buildHref, icon: "✎" },
    { label: "Tailor to a job", desc: "Match a job description", href: "/tailor", icon: "◎" },
    { label: "Cover letter", desc: "Draft in your voice", href: "/cover", icon: "✉" },
    { label: "Log application", desc: "Track a send", href: "/applications", icon: "▣" },
    { label: "Insights", desc: "Your funnel & wins", href: "/insights", icon: "📊" },
  ];

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1080px] px-12 pb-16 pt-[42px]">
        <div className="mb-7">
          <h1 className="font-display text-[30px] font-semibold tracking-[-0.025em] text-ink">
            Welcome{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="mt-2 max-w-[620px] text-[14.5px] leading-relaxed text-muted">
            This is your job-search command center — build and tailor resumes,
            send cover letters and Q&amp;A, then track what actually lands.
          </p>
        </div>

        {/* Start-here hero for new users */}
        {isNew ? (
          <Link
            href={buildHref}
            className="mb-7 flex items-center gap-[18px] rounded-2xl bg-gradient-to-br from-sidebar to-[#1b2740] px-[24px] py-[22px] text-white transition-shadow hover:shadow-[0_14px_36px_rgba(15,17,22,0.22)]"
          >
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px] bg-gradient-to-br from-accent to-[#7A53FF] text-[23px] shadow-[0_6px_18px_rgba(47,107,255,0.4)]">
              ✎
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[16.5px] font-semibold">
                Start here — build your first resume
              </div>
              <div className="mt-[3px] text-[13.3px] leading-[1.5] text-[#AEB6C2]">
                We&apos;ll guide you step by step{isStudent ? " — built for students and first resumes" : ""}. It&apos;s easier than it feels.
              </div>
            </div>
            <div className="flex-none whitespace-nowrap rounded-[11px] bg-white px-[18px] py-[11px] text-[13.5px] font-semibold text-ink">
              Build step by step →
            </div>
          </Link>
        ) : null}

        {/* At a glance */}
        <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Resumes" value={String(versionsCount)} />
          <StatCard label="Applications" value={String(applicationsCount)} />
          <StatCard label="Response rate" value={`${stats.respRate}%`} />
          <StatCard label="Interviews" value={`${stats.interviewRate}%`} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          {/* Getting started checklist */}
          <section className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                Getting started
              </h2>
              <span className="text-[12.5px] font-semibold text-muted">
                {doneCount}/{checklist.length} done
              </span>
            </div>
            <p className="mb-4 text-[12.5px] text-muted">
              A quick path from blank page to tracked applications.
            </p>
            <div className="space-y-2.5">
              {checklist.map((item) => (
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

          {/* Quick actions + upcoming */}
          <div className="flex flex-col gap-5">
            <section className="rounded-2xl border border-border bg-white p-6">
              <h2 className="mb-4 font-display text-[15px] font-semibold text-ink">
                Quick actions
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl border border-[#EEF0F3] px-3.5 py-2.5 transition-colors hover:border-[#D9DEE5] hover:bg-[#FAFBFC]"
                  >
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-[#EEF3FF] text-[15px] text-accent">
                      {action.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-semibold text-ink">
                        {action.label}
                      </div>
                      <div className="truncate text-[12px] text-muted">
                        {action.desc}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {upcoming.length > 0 ? (
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
            ) : null}
          </div>
        </div>

        {/* How it works */}
        <section className="mt-5 rounded-2xl border border-border bg-white p-6">
          <h2 className="font-display text-[15px] font-semibold text-ink">
            How {`ResumeTrakr`} works
          </h2>
          <p className="mt-1 text-[12.5px] text-muted">
            Six modules, one closed loop — each step feeds the next.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {MODULES.map((m) => (
              <div
                key={m.n}
                className="rounded-xl border border-[#EEF0F3] bg-[#FCFCFD] px-3 py-3"
              >
                <div className="font-display text-[11px] font-semibold text-[#b3aab8]">
                  {m.n}
                </div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink">
                  {m.title}
                </div>
                <div className="mt-1 text-[11.5px] leading-snug text-muted">
                  {m.body}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: DashboardStat) {
  return (
    <div className="rounded-[14px] border border-border bg-white px-[18px] py-4">
      <div className="font-display text-[24px] font-semibold leading-none text-ink">
        {value}
      </div>
      <div className="mt-1.5 text-xs font-semibold text-muted">{label}</div>
    </div>
  );
}
