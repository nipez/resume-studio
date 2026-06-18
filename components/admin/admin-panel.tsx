"use client";

import {
  createDemoUser,
  deleteDemoUser,
  viewAsDemoUser,
  viewAsUser,
  type DemoUser,
} from "@/lib/admin/actions";
import type { AdminDashboardStats, AdminUserRow } from "@/lib/admin/types";
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
};

type Tab = "users" | "demos";

export function AdminPanel({
  adminEmail,
  stats,
  users,
  demoUsers,
}: AdminPanelProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [makeStudent, setMakeStudent] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.fullName?.toLowerCase().includes(q) ?? false)
    );
  }, [users, query]);

  function handleViewAs(userId: string) {
    setError("");
    setBusyId(userId);
    startTransition(async () => {
      try {
        await viewAsUser(userId);
        router.push("/dashboard");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to view as user");
        setBusyId(null);
      }
    });
  }

  function handleCreateDemo() {
    setError("");
    startTransition(async () => {
      try {
        await createDemoUser({
          label: label.trim() || "Demo student",
          makeStudent,
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
    startTransition(async () => {
      try {
        await viewAsDemoUser(id);
        router.push("/dashboard");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to open as user");
        setBusyId(null);
      }
    });
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

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total users" value={String(stats.totalUsers)} />
          <StatCard
            label="Active (30 days)"
            value={String(stats.activeUsers30d)}
            hint="Signed in within 30 days"
          />
          <StatCard label="Signed in today" value={String(stats.signedInToday)} />
          <StatCard label="Student personas" value={String(stats.studentPersonas)} />
        </div>

        <div className="mt-6 flex gap-1 rounded-xl border border-[#E4E7EC] bg-[#FAFBFC] p-1">
          <TabButton active={tab === "users"} onClick={() => setTab("users")}>
            All users ({users.length})
          </TabButton>
          <TabButton active={tab === "demos"} onClick={() => setTab("demos")}>
            Demo personas ({demoUsers.length})
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search email or name…"
                className="min-w-[220px] rounded-[10px] border border-[#DFE3E8] px-3 py-2 text-[13px] focus:border-accent focus:outline-none"
              />
            </div>
            <div className="hidden grid-cols-[minmax(180px,1.4fr)_minmax(120px,0.8fr)_100px_80px_80px_120px] gap-3 border-b border-[#EEF0F3] bg-[#FAFBFC] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0] lg:grid">
              <div>User</div>
              <div>Last login</div>
              <div>Persona</div>
              <div>Resumes</div>
              <div>Apps</div>
              <div className="text-right">Actions</div>
            </div>
            {filteredUsers.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13.5px] text-muted">
                No users match your search.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  busy={pending && busyId === u.id}
                  onViewAs={() => handleViewAs(u.id)}
                />
              ))
            )}
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-2xl border border-border bg-white p-6">
              <h2 className="font-display text-[15px] font-semibold text-ink">
                Create a demo persona
              </h2>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <label className="flex flex-1 flex-col gap-1.5 text-xs font-semibold text-[#5A6573]">
                  Label
                  <input
                    value={label}
                    placeholder="e.g. High-school student"
                    onChange={(e) => setLabel(e.target.value)}
                    className="min-w-[220px] rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-[13.5px] text-[#3a4350]">
                  <input
                    type="checkbox"
                    checked={makeStudent}
                    onChange={(e) => setMakeStudent(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-[#2F6BFF]"
                  />
                  Mark as student
                </label>
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
              <div className="grid grid-cols-[1fr_140px_160px] gap-3 border-b border-[#EEF0F3] bg-[#FAFBFC] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
                <div>Persona</div>
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
                    className="grid grid-cols-[1fr_140px_160px] items-center gap-3 border-b border-[#F2F3F5] px-6 py-3.5 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold text-ink">
                        {u.label}
                      </div>
                      <div className="truncate text-[12px] text-muted">{u.email}</div>
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

function UserRow({
  user,
  busy,
  onViewAs,
}: {
  user: AdminUserRow;
  busy: boolean;
  onViewAs: () => void;
}) {
  const active = isActiveUser(user.lastSignInAt);

  return (
    <div className="border-b border-[#F2F3F5] px-6 py-4 last:border-b-0 lg:grid lg:grid-cols-[minmax(180px,1.4fr)_minmax(120px,0.8fr)_100px_80px_80px_120px] lg:items-center lg:gap-3 lg:py-3.5">
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
        {user.fullName ? (
          <div className="mt-1 text-[11px] text-[#9AA3AF] lg:hidden">
            Joined {formatAdminDate(user.createdAt)}
          </div>
        ) : null}
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

      <div className="mt-2 text-[13px] text-ink lg:mt-0">{user.resumeCount}</div>
      <div className="mt-2 text-[13px] text-ink lg:mt-0">{user.applicationCount}</div>

      <div className="mt-3 flex justify-start lg:mt-0 lg:justify-end">
        {user.isAdmin ? (
          <span className="text-[12px] text-muted">—</span>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={onViewAs}
            className="cursor-pointer rounded-lg bg-sidebar px-3 py-[7px] text-xs font-semibold text-white transition-colors hover:bg-[#272b33] disabled:opacity-60"
          >
            {busy ? "Opening…" : "View as"}
          </button>
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
