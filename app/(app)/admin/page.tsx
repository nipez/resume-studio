import { AdminPanel } from "@/components/admin/admin-panel";
import { listDemoUsers } from "@/lib/admin/actions";
import { isAdminUser } from "@/lib/auth/admin";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { user } = await getSessionProfile();
  if (!isAdminUser(user)) {
    redirect("/library");
  }

  const demoUsers = await listDemoUsers();

  return <AdminPanel demoUsers={demoUsers} adminEmail={user?.email ?? ""} />;
}
