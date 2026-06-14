import { AppShell } from "@/components/shell/app-shell";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, displayName } =
    await getSessionProfile();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      userName={displayName}
      positioning={profile?.positioning}
    >
      {children}
    </AppShell>
  );
}
