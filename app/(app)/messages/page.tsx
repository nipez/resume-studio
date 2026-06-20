import { MessagesPageClient } from "@/components/support/messages-page-client";
import { listMySupportTickets } from "@/lib/support/actions";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  let tickets: Awaited<ReturnType<typeof listMySupportTickets>> = [];
  try {
    tickets = await listMySupportTickets();
  } catch {
    tickets = [];
  }

  return <MessagesPageClient tickets={tickets} />;
}
