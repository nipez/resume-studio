import { AppShell } from "@/components/shell/app-shell";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, displayName, avatarLetter } =
    await getSessionProfile();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      userName={displayName}
      avatarLetter={avatarLetter}
      positioning={profile?.positioning}
    >
      {children}
    </AppShell>
  );
}
