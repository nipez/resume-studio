import { AppShell } from "@/components/shell/app-shell";
import { getImpersonationState } from "@/lib/admin/actions";
import { isAdminUser } from "@/lib/auth/admin";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, displayName, profileFullName } = await getSessionProfile();

  if (!user) {
    redirect("/login");
  }

  const impersonation = await getImpersonationState();
  const isAdmin = isAdminUser(user) && !impersonation.impersonating;

  return (
    <AppShell
      userName={displayName}
      profileFullName={profileFullName}
      userEmail={user.email ?? null}
      positioning={profile?.positioning}
      isAdmin={isAdmin}
      impersonatingLabel={impersonation.impersonating ? impersonation.label : null}
    >
      {children}
    </AppShell>
  );
}
