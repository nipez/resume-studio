import { AdminPanel } from "@/components/admin/admin-panel";
import {
  getAdminDashboardData,
  listDemoUsers,
} from "@/lib/admin/actions";
import { getStoredImpersonatorEmail } from "@/lib/admin/restore-session";
import { isAdminUser } from "@/lib/auth/admin";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
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

  return (
    <AdminPanel
      adminEmail={user?.email ?? ""}
      stats={stats}
      users={users}
      demoUsers={demoUsers}
    />
  );
}
