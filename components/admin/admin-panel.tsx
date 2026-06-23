"use client";

import {
  createDemoUser,
  deleteDemoUser,
  resetUserPersona,
  type DemoUser,
} from "@/lib/admin/actions";
import { AdminPlansTab } from "@/components/admin/admin-plans-tab";
import { AdminSupportTab } from "@/components/admin/admin-support-tab";
import { AdminAIUsageTab } from "@/components/admin/admin-ai-usage-tab";
import type { AdminDashboardStats, AdminUserRow } from "@/lib/admin/types";
import { formatUsdCost, type AdminAIUsageDashboard } from "@/lib/admin/ai-usage-types";
import type { AdminSupportTicket } from "@/lib/support/types";
import type { BillingPlanId } from "@/lib/billing/plans";
import { BILLING_PLANS } from "@/lib/billing/plans";
import {
  formatAdminDate,
  isActiveUser,
  relativeLastSeen,
} from "@/lib/admin/types";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type AdminPanelProps = {
  adminEmail: string;
  stats: AdminDashboardStats;
  users: AdminUserRow[];
  demoUsers: DemoUser[];
  supportTickets: AdminSupportTicket[];
  openSupportCount: number;
  aiUsage: AdminAIUsageDashboard;
  aiEnforcePlanTiers?: boolean;
};

type Tab = "users" | "demos" | "support" | "ai" | "plans";
type PersonaFilter = "all" | "student" | "professional" | "none";
type SortKey =
  | "lastSignIn"
  | "name"
  | "persona"
  | "onboarding"
  | "resumes"
  | "apps";

const PAGE_SIZE = 50;

export function AdminPanel({
  adminEmail,
  stats,
  users,
  demoUsers,
  supportTickets,
  openSupportCount,
  aiUsage,
  aiEnforcePlanTiers = false,
}: AdminPanelProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [demoPlanTier, setDemoPlanTier] = useState<BillingPlanId>("pro");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [personaFilter, setPersonaFilter] = useState<PersonaFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastSignIn");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = users;

    if (personaFilter === "student") {
      rows = rows.filter((u) => u.persona === "student");
    } else if (personaFilter === "professional") {
      rows = rows.filter((u) => u.persona === "professional");
    } else if (personaFilter === "none") {
      rows = rows.filter((u) => !u.persona);
    }

    if (q) {
      rows = rows.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.fullName?.toLowerCase().includes(q) ?? false)
      );
    }

    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = (a.fullName || a.email).localeCompare(b.fullName || b.email);
          break;
        case "persona":
          cmp = (a.persona ?? "zzz").localeCompare(b.persona ?? "zzz");
          break;
        case "onboarding":
          cmp = Number(a.onboardingPersonaSet) - Number(b.onboardingPersonaSet);
          break;
        case "resumes":
          cmp = a.resumeCount - b.resumeCount;
          break;
        case "apps":
          cmp = a.applicationCount - b.applicationCount;
          break;
        case "lastSignIn":
        default: {
          const aTime = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0;
          const bTime = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0;
          cmp = aTime - bTime;
          break;
        }
      }
      return sortAsc ? cmp : -cmp;
    });

    return sorted;
  }, [users, query, personaFilter, sortKey, sortAsc]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pagedUsers = filteredUsers.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  );

  function handleSort(next: SortKey) {
    if (sortKey === next) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(next);
      setSortAsc(next === "name" || next === "persona");
    }
    setPage(0);
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortAsc ? " ↑" : " ↓";
  }

  function handleViewAs(userId: string) {
    setError("");
    setBusyId(userId);
    window.location.href = `/api/admin/view-as?userId=${encodeURIComponent(userId)}`;
  }

  function handleResetPersona(userId: string) {
    if (
      !confirm(
        "Reset this user's persona? They'll see the first-run path picker again on Home."
      )
    ) {
      return;
    }
    setBusyId(userId);
    startTransition(async () => {
      try {
        await resetUserPersona(userId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to reset persona");
      } finally {
        setBusyId(null);
      }
    });
  }

  function handleCreateDemo() {
    setError("");
    startTransition(async () => {
      try {
        await createDemoUser({
          label: label.trim() || "Demo user",
          planTier: demoPlanTier,
        });
        setLabel("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create");
      }
    });
  }

  function handleOpenDemoAs(id: string) {
    setError("");
    setBusyId(id);
    window.location.href = `/api/admin/view-as?userId=${encodeURIComponent(id)}`;
  }

  function handleDeleteDemo(id: string) {
    if (!confirm("Delete this demo user and all their data?")) return;
    setBusyId(id);
    startTransition(async () => {
      try {
        await deleteDemoUser(id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete");
      } finally {
        setBusyId(null);
      }
    });
  }

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1100px] px-12 pb-16 pt-[42px]">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Super admin
        </h1>
        <p className="mt-2 max-w-[720px] text-[14.5px] leading-relaxed text-muted">
          Signed in as <span className="font-semibold text-ink">{adminEmail}</span>.
          See every account, when they last logged in, and{" "}
          <span className="font-semibold text-ink">View as</span> any user to walk
          through the product exactly as they see it. Return from the banner at any
          time.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total users" value={String(stats.totalUsers)} />
          <StatCard
            label="Active (30 days)"
            value={String(stats.activeUsers30d)}
            hint="Signed in within 30 days"
          />
          <StatCard label="Signed in today" value={String(stats.signedInToday)} />
          <StatCard label="Students" value={String(stats.studentPersonas)} />
          <StatCard label="Professionals" value={String(stats.professionalPersonas)} />
          <StatCard label="No persona" value={String(stats.noPersona)} />
        </div>

        {aiUsage.available ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="API cost today"
              value={formatUsdCost(aiUsage.costTodayUsd)}
              hint={`${aiUsage.actionsToday} AI actions`}
            />
            <StatCard
              label="API cost (7d)"
              value={formatUsdCost(aiUsage.costLast7DaysUsd)}
            />
            <StatCard
              label="API cost (MTD)"
              value={formatUsdCost(aiUsage.costMonthToDateUsd)}
              hint={`${aiUsage.actionsMonthToDate} actions this month`}
            />
            <StatCard
              label="API cost (all time)"
              value={formatUsdCost(aiUsage.costAllTimeUsd)}
              hint="Last 365 days logged"
            />
          </div>
        ) : null}

        <div className="mt-6 flex gap-1 rounded-xl border border-[#E4E7EC] bg-[#FAFBFC] p-1">
          <TabButton active={tab === "users"} onClick={() => setTab("users")}>
            All users ({users.length})
          </TabButton>
          <TabButton active={tab === "demos"} onClick={() => setTab("demos")}>
            Demo personas ({demoUsers.length})
          </TabButton>
          <TabButton active={tab === "support"} onClick={() => setTab("support")}>
            Support{openSupportCount > 0 ? ` (${openSupportCount})` : ""}
          </TabButton>
          <TabButton active={tab === "ai"} onClick={() => setTab("ai")}>
            AI costs
          </TabButton>
          <TabButton active={tab === "plans"} onClick={() => setTab("plans")}>
            Plans
          </TabButton>
        </div>

        {error ? (
          <p className="mt-3 text-[13px] font-semibold text-[#B23B3B]">{error}</p>
        ) : null}

        {tab === "users" ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F3] px-6 py-4">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                User accounts
              </h2>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="Search email or name…"
                className="min-w-[220px] rounded-[10px] border border-[#DFE3E8] px-3 py-2 text-[13px] focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 border-b border-[#EEF0F3] px-6 py-3">
              {(
                [
                  ["all", "All"],
                  ["student", "Student"],
                  ["professional", "Professional"],
                  ["none", "No persona"],
                ] as const
              ).map(([id, labelText]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setPersonaFilter(id);
                    setPage(0);
                  }}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                    personaFilter === id
                      ? "border-accent/30 bg-[#EEF3FF] text-accent"
                      : "border-[#E2E5EA] bg-white text-muted hover:border-[#C8CED6] hover:text-ink"
                  }`}
                >
                  {labelText}
                </button>
              ))}
              <span className="ml-auto self-center text-[12px] text-muted">
                {filteredUsers.length} match
                {filteredUsers.length !== users.length ? ` of ${users.length}` : ""}
              </span>
            </div>

            <div className="hidden grid-cols-[minmax(160px,1.2fr)_minmax(110px,0.7fr)_80px_72px_56px_56px_140px] gap-3 border-b border-[#EEF0F3] bg-[#FAFBFC] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0] lg:grid">
              <SortHeader label="User" active={sortKey === "name"} onClick={() => handleSort("name")}>
                User{sortIndicator("name")}
              </SortHeader>
              <SortHeader
                label="Last login"
                active={sortKey === "lastSignIn"}
                onClick={() => handleSort("lastSignIn")}
              >
                Last login{sortIndicator("lastSignIn")}
              </SortHeader>
              <SortHeader
                label="Persona"
                active={sortKey === "persona"}
                onClick={() => handleSort("persona")}
              >
                Persona{sortIndicator("persona")}
              </SortHeader>
              <SortHeader
                label="Onboarded"
                active={sortKey === "onboarding"}
                onClick={() => handleSort("onboarding")}
              >
                Onboarded{sortIndicator("onboarding")}
              </SortHeader>
              <SortHeader
                label="Resumes"
                active={sortKey === "resumes"}
                onClick={() => handleSort("resumes")}
              >
                Res{sortIndicator("resumes")}
              </SortHeader>
              <SortHeader label="Apps" active={sortKey === "apps"} onClick={() => handleSort("apps")}>
                Apps{sortIndicator("apps")}
              </SortHeader>
              <div className="text-right">Actions</div>
            </div>

            {pagedUsers.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13.5px] text-muted">
                No users match your filters.
              </div>
            ) : (
              pagedUsers.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  busy={pending && busyId === u.id}
                  onViewAs={() => handleViewAs(u.id)}
                  onResetPersona={() => handleResetPersona(u.id)}
                />
              ))
            )}

            {pageCount > 1 ? (
              <div className="flex items-center justify-between border-t border-[#EEF0F3] px-6 py-3">
                <span className="text-[12.5px] text-muted">
                  Page {safePage + 1} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={safePage === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-3 py-1.5 text-[12px] font-semibold text-ink disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= pageCount - 1}
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-3 py-1.5 text-[12px] font-semibold text-ink disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : tab === "support" ? (
          <AdminSupportTab tickets={supportTickets} />
        ) : tab === "ai" ? (
          <AdminAIUsageTab data={aiUsage} />
        ) : tab === "plans" ? (
          <AdminPlansTab />
        ) : (
          <>
            <div className="mt-4 rounded-2xl border border-border bg-white p-6">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                Create a demo persona
              </h2>
              <p className="mt-1.5 max-w-[640px] text-[13px] leading-relaxed text-muted">
                Pick a plan tier, then <span className="font-semibold text-ink">View as</span>{" "}
                to walk through the product as that user. Student shows the student path;
                Standard is workspace-only; Pro includes full AI.
                {!aiEnforcePlanTiers ? (
                  <>
                    {" "}
                    <span className="font-semibold text-[#1E54E6]">
                      Note: AI tier gates are off in pilot — everyone still gets Pro AI until
                      you set <code className="text-[12px]">AI_ENFORCE_PLAN_TIERS=true</code> on
                      Railway.
                    </span>
                  </>
                ) : null}
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="flex min-w-[220px] flex-1 flex-col gap-1.5 text-xs font-semibold text-[#5A6573]">
                  Label
                  <input
                    value={label}
                    placeholder={
                      demoPlanTier === "student"
                        ? "e.g. High-school student"
                        : demoPlanTier === "standard"
                          ? "e.g. DIY job searcher"
                          : "e.g. Active job seeker (Pro)"
                    }
                    onChange={(e) => setLabel(e.target.value)}
                    className="rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                </label>
                <div className="flex flex-col gap-1.5 pb-0.5">
                  <span className="text-xs font-semibold text-[#5A6573]">Plan tier</span>
                  <div className="flex flex-wrap gap-1.5 rounded-[10px] border border-[#E2E5EA] bg-[#FAFBFC] p-1">
                    {BILLING_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setDemoPlanTier(plan.id)}
                        className={`cursor-pointer rounded-[8px] border-none px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                          demoPlanTier === plan.id
                            ? "bg-white text-accent shadow-[0_1px_4px_rgba(15,17,22,0.08)]"
                            : "bg-transparent text-[#5A6573] hover:text-ink"
                        }`}
                      >
                        {plan.displayName}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleCreateDemo}
                  className="cursor-pointer rounded-[10px] border-none bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6] disabled:opacity-60"
                >
                  {pending ? "Working…" : "Create persona"}
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white">
              <div className="grid grid-cols-[1fr_100px_120px_160px] gap-3 border-b border-[#EEF0F3] bg-[#FAFBFC] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
                <div>Persona</div>
                <div>Plan</div>
                <div>Created</div>
                <div className="text-right">Actions</div>
              </div>
              {demoUsers.length === 0 ? (
                <div className="px-6 py-10 text-center text-[13.5px] text-muted">
                  No demo personas yet. Create one above to start.
                </div>
              ) : (
                demoUsers.map((u) => (
                  <div
                    key={u.id}
                    className="grid grid-cols-[1fr_100px_120px_160px] items-center gap-3 border-b border-[#F2F3F5] px-6 py-3.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold text-ink">
                        {u.label}
                      </div>
                      <div className="truncate text-[12px] text-muted">{u.email}</div>
                    </div>
                    <div>
                      <PlanTierBadge tier={u.planTier} />
                    </div>
                    <div className="text-[12.5px] text-muted">
                      {new Date(u.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleOpenDemoAs(u.id)}
                        className="cursor-pointer rounded-lg bg-sidebar px-3 py-[7px] text-xs font-semibold text-white transition-colors hover:bg-[#272b33] disabled:opacity-60"
                      >
                        {busyId === u.id ? "Opening…" : "View as"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleDeleteDemo(u.id)}
                        className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-2.5 py-[7px] text-xs text-[#B23B3B] transition-colors hover:border-[#E0A0A0] hover:bg-[#FFF6F6] disabled:opacity-60"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SortHeader({
  children,
  active,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer border-none bg-transparent p-0 text-left text-[11px] font-bold uppercase tracking-[0.06em] ${
        active ? "text-accent" : "text-[#8A92A0] hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function UserRow({
  user,
  busy,
  onViewAs,
  onResetPersona,
}: {
  user: AdminUserRow;
  busy: boolean;
  onViewAs: () => void;
  onResetPersona: () => void;
}) {
  const active = isActiveUser(user.lastSignInAt);

  return (
    <div className="border-b border-[#F2F3F5] px-6 py-4 last:border-b-0 lg:grid lg:grid-cols-[minmax(160px,1.2fr)_minmax(110px,0.7fr)_80px_72px_56px_56px_140px] lg:items-center lg:gap-3 lg:py-3.5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-ink">
            {user.fullName || user.email}
          </span>
          {user.isAdmin ? (
            <Badge tone="admin">Admin</Badge>
          ) : null}
          {user.isDemo ? <Badge tone="demo">Demo</Badge> : null}
          {active ? <Badge tone="active">Active</Badge> : null}
        </div>
        <div className="truncate text-[12px] text-muted">{user.email}</div>
      </div>

      <div className="mt-2 lg:mt-0">
        <div className="text-[13px] font-medium text-ink lg:hidden">Last login</div>
        <div className="text-[13px] text-ink" title={formatAdminDate(user.lastSignInAt)}>
          {relativeLastSeen(user.lastSignInAt)}
        </div>
      </div>

      <div className="mt-2 capitalize text-[12.5px] text-muted lg:mt-0">
        {user.persona ?? "—"}
      </div>

      <div className="mt-2 text-[12.5px] lg:mt-0">
        {user.onboardingPersonaSet ? (
          <span className="font-semibold text-[#0E7C4B]">Yes</span>
        ) : (
          <span className="text-muted">No</span>
        )}
      </div>

      <div className="mt-2 text-[13px] text-ink lg:mt-0">{user.resumeCount}</div>
      <div className="mt-2 text-[13px] text-ink lg:mt-0">{user.applicationCount}</div>

      <div className="mt-3 flex flex-wrap justify-start gap-1.5 lg:mt-0 lg:justify-end">
        {user.isAdmin ? (
          <span className="text-[12px] text-muted">—</span>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={onViewAs}
              className="cursor-pointer rounded-lg bg-sidebar px-3 py-[7px] text-xs font-semibold text-white transition-colors hover:bg-[#272b33] disabled:opacity-60"
            >
              {busy ? "…" : "View as"}
            </button>
            {user.onboardingPersonaSet || user.persona ? (
              <button
                type="button"
                disabled={busy}
                onClick={onResetPersona}
                title="Clear persona so user sees first-run picker again"
                className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-2.5 py-[7px] text-xs font-semibold text-[#5A6573] transition-colors hover:border-[#C8CED6] disabled:opacity-60"
              >
                Reset
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[14px] border border-border bg-white px-[18px] py-4">
      <div className="font-display text-[24px] font-semibold leading-none text-ink">
        {value}
      </div>
      <div className="mt-1.5 text-xs font-semibold text-muted">{label}</div>
      {hint ? <div className="mt-0.5 text-[10.5px] text-[#9AA3AF]">{hint}</div> : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer flex-1 rounded-lg border-none px-4 py-2.5 text-[13px] font-semibold transition-colors ${
        active
          ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          : "bg-transparent text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function PlanTierBadge({ tier }: { tier: BillingPlanId }) {
  const styles: Record<BillingPlanId, string> = {
    student: "bg-[#E1F6F9] text-[#0C7C8C]",
    standard: "bg-[#F2F3F5] text-[#5A6573]",
    pro: "bg-[#EEF3FF] text-[#1E54E6]",
  };
  const labels: Record<BillingPlanId, string> = {
    student: "Student",
    standard: "Standard",
    pro: "Pro",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[tier]}`}
    >
      {labels[tier]}
    </span>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "active" | "demo" | "admin";
}) {
  const styles = {
    active: "bg-[#E6F7EE] text-[#0E7C4B]",
    demo: "bg-[#EEF3FF] text-[#1E54E6]",
    admin: "bg-[#F3EDFF] text-[#6B3FA0]",
  }[tone];

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles}`}
    >
      {children}
    </span>
  );
}
