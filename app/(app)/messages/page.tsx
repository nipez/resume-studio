import { MessagesPageClient } from "@/components/support/messages-page-client";
import { getUserProfileContext } from "@/lib/profile/actions";
import { listMySupportTickets } from "@/lib/support/actions";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  let tickets: Awaited<ReturnType<typeof listMySupportTickets>> = [];
  try {
    tickets = await listMySupportTickets();
  } catch {
    tickets = [];
  }

  let isStudent = false;
  try {
    const profile = await getUserProfileContext();
    isStudent = profile.isStudent;
  } catch {
    isStudent = false;
  }

  return <MessagesPageClient tickets={tickets} isStudent={isStudent} />;
}
