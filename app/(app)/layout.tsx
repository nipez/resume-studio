import { AppShell } from "@/components/shell/app-shell";
import { getImpersonationState } from "@/lib/admin/actions";
import { isAdminUser } from "@/lib/auth/admin";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { getSupportUnreadCount } from "@/lib/support/actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, displayName, profileFullName, isStudent, hasResume } =
    await getSessionProfile();

  if (!user) {
    redirect("/login");
  }

  const impersonation = await getImpersonationState();
  const isAdmin = isAdminUser(user) && !impersonation.impersonating;

  let supportUnreadCount = 0;
  try {
    supportUnreadCount = await getSupportUnreadCount();
  } catch {
    supportUnreadCount = 0;
  }

  return (
    <AppShell
      userName={displayName}
      profileFullName={profileFullName}
      userEmail={user.email ?? null}
      positioning={profile?.positioning}
      isAdmin={isAdmin}
      isStudent={isStudent}
      hasResume={hasResume}
      impersonatingLabel={impersonation.impersonating ? impersonation.label : null}
      supportUnreadCount={supportUnreadCount}
    >
      {children}
    </AppShell>
  );
}
