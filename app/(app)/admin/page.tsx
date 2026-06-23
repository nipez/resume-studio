import { AdminPanel } from "@/components/admin/admin-panel";
import {
  getAdminDashboardData,
  listDemoUsers,
} from "@/lib/admin/actions";
import { getStoredImpersonatorEmail } from "@/lib/admin/restore-session";
import { isAdminUser } from "@/lib/auth/admin";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import {
  getAdminOpenSupportCount,
  listAdminSupportTickets,
} from "@/lib/support/actions";
import { AI_ENFORCE_PLAN_TIERS } from "@/lib/ai/config";
import { getAdminAIUsageDashboard } from "@/lib/admin/ai-usage";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { user } = await getSessionProfile();
  if (!isAdminUser(user)) {
    // While view-as is active the browser session is the target user, but the
    // signed impersonator cookie still points at the real admin account.
    if (getStoredImpersonatorEmail()) {
      redirect("/api/admin/exit-view-as");
    }
    redirect("/library");
  }

  const [{ users, stats }, demoUsers] = await Promise.all([
    getAdminDashboardData(),
    listDemoUsers(),
  ]);

  const [supportResult, aiUsage] = await Promise.all([
    Promise.all([
      listAdminSupportTickets().catch(() => [] as Awaited<ReturnType<typeof listAdminSupportTickets>>),
      getAdminOpenSupportCount().catch(() => 0),
    ]),
    getAdminAIUsageDashboard().catch(() => null),
  ]);

  const [supportTickets, openSupportCount] = supportResult;
  const aiUsageData =
    aiUsage ?? {
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

  return (
    <AdminPanel
      adminEmail={user?.email ?? ""}
      stats={stats}
      users={users}
      demoUsers={demoUsers}
      supportTickets={supportTickets}
      openSupportCount={openSupportCount}
      aiUsage={aiUsageData}
      aiEnforcePlanTiers={AI_ENFORCE_PLAN_TIERS}
    />
  );
}
