import type { UserPersona } from "@/lib/profile/persona";

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string | null;
  persona: UserPersona | null;
  createdAt: string;
  lastSignInAt: string | null;
  resumeCount: number;
  applicationCount: number;
  isDemo: boolean;
  isAdmin: boolean;
};

export type AdminDashboardStats = {
  totalUsers: number;
  activeUsers30d: number;
  signedInToday: number;
  studentPersonas: number;
};

export function isActiveUser(lastSignInAt: string | null, withinDays = 30): boolean {
  if (!lastSignInAt) return false;
  const last = new Date(lastSignInAt).getTime();
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
  return last >= cutoff;
}

export function isSignedInToday(lastSignInAt: string | null): boolean {
  if (!lastSignInAt) return false;
  const d = new Date(lastSignInAt);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function formatAdminDate(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relativeLastSeen(iso: string | null): string {
  if (!iso) return "Never signed in";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatAdminDate(iso);
}
