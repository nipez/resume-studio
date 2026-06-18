import { AdminPanel } from "@/components/admin/admin-panel";
import {
  getAdminDashboardData,
  listDemoUsers,
} from "@/lib/admin/actions";
import { isAdminUser } from "@/lib/auth/admin";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { user } = await getSessionProfile();
  if (!isAdminUser(user)) {
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
