"use server";

import { isAdminUser } from "@/lib/auth/admin";
import type {
  AdminSupportTicket,
  SupportCategory,
  SupportMessage,
  SupportTicket,
  SupportTicketStatus,
} from "@/lib/support/types";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function mapMessage(row: Record<string, unknown>): SupportMessage {
  return {
    id: row.id as string,
    ticket_id: row.ticket_id as string,
    sender_role: row.sender_role as "user" | "admin",
    body: String(row.body ?? ""),
    read_by_user_at: (row.read_by_user_at as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

function mapTicket(
  row: Record<string, unknown>,
  messages?: SupportMessage[]
): SupportTicket {
  const ticketMessages = messages ?? [];
  const unreadAdminReplies = ticketMessages.filter(
    (m) => m.sender_role === "admin" && !m.read_by_user_at
  ).length;

  return {
    id: row.id as string,
    user_id: row.user_id as string,
    category: row.category as SupportCategory,
    message: String(row.message ?? ""),
    status: row.status as SupportTicketStatus,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    messages: ticketMessages,
    unreadAdminReplies,
  };
}

async function requireUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

async function requireAdminUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminUser(user)) throw new Error("Not authorized");
  return user!;
}

export async function createSupportTicket(input: {
  category: SupportCategory;
  message: string;
}): Promise<SupportTicket> {
  const trimmed = input.message.trim();
  if (!trimmed) throw new Error("Write a message so we know how to help.");
  if (trimmed.length > 4000) throw new Error("Message is too long.");

  const { supabase, userId } = await requireUserId();

  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({
      user_id: userId,
      category: input.category,
      message: trimmed,
      status: "open",
    })
    .select("*")
    .single();

  if (ticketError || !ticket) {
    throw new Error(ticketError?.message ?? "Could not send your message.");
  }

  const { error: messageError } = await supabase.from("support_messages").insert({
    ticket_id: ticket.id,
    sender_role: "user",
    body: trimmed,
  });

  if (messageError) {
    throw new Error(messageError.message);
  }

  revalidatePath("/messages");
  revalidatePath("/admin");

  return mapTicket(ticket as Record<string, unknown>, [
    {
      id: "pending",
      ticket_id: ticket.id as string,
      sender_role: "user",
      body: trimmed,
      read_by_user_at: null,
      created_at: ticket.created_at as string,
    },
  ]);
}

export async function getSupportUnreadCount(): Promise<number> {
  const { supabase, userId } = await requireUserId();

  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("user_id", userId);

  const ticketIds = (tickets ?? []).map((t) => t.id);
  if (ticketIds.length === 0) return 0;

  const { count, error } = await supabase
    .from("support_messages")
    .select("id", { count: "exact", head: true })
    .in("ticket_id", ticketIds)
    .eq("sender_role", "admin")
    .is("read_by_user_at", null);

  if (error) return 0;
  return count ?? 0;
}

export async function listMySupportTickets(): Promise<SupportTicket[]> {
  const { supabase, userId } = await requireUserId();

  const { data: tickets, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!tickets?.length) return [];

  const ticketIds = tickets.map((t) => t.id);
  const { data: messages } = await supabase
    .from("support_messages")
    .select("*")
    .in("ticket_id", ticketIds)
    .order("created_at", { ascending: true });

  const messagesByTicket = new Map<string, SupportMessage[]>();
  for (const row of messages ?? []) {
    const mapped = mapMessage(row as Record<string, unknown>);
    const list = messagesByTicket.get(mapped.ticket_id) ?? [];
    list.push(mapped);
    messagesByTicket.set(mapped.ticket_id, list);
  }

  return tickets.map((row) =>
    mapTicket(row as Record<string, unknown>, messagesByTicket.get(row.id as string))
  );
}

export async function markSupportTicketRead(ticketId: string): Promise<void> {
  const { supabase, userId } = await requireUserId();

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!ticket) return;

  await supabase
    .from("support_messages")
    .update({ read_by_user_at: new Date().toISOString() })
    .eq("ticket_id", ticketId)
    .eq("sender_role", "admin")
    .is("read_by_user_at", null);

  revalidatePath("/messages");
}

export async function listAdminSupportTickets(): Promise<AdminSupportTicket[]> {
  await requireAdminUser();
  const svc = createServiceClient();

  const { data: tickets, error } = await svc
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!tickets?.length) return [];

  const userIds = [...new Set(tickets.map((t) => t.user_id as string))];
  const ticketIds = tickets.map((t) => t.id as string);

  const [{ data: profiles }, { data: messages }] = await Promise.all([
    svc.from("profiles").select("id, full_name").in("id", userIds),
    svc
      .from("support_messages")
      .select("*")
      .in("ticket_id", ticketIds)
      .order("created_at", { ascending: true }),
  ]);

  const emailById = new Map<string, string>();
  await Promise.all(
    userIds.map(async (id) => {
      const { data } = await svc.auth.admin.getUserById(id);
      emailById.set(id, data.user?.email ?? "unknown");
    })
  );

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const messagesByTicket = new Map<string, SupportMessage[]>();
  for (const row of messages ?? []) {
    const mapped = mapMessage(row as Record<string, unknown>);
    const list = messagesByTicket.get(mapped.ticket_id) ?? [];
    list.push(mapped);
    messagesByTicket.set(mapped.ticket_id, list);
  }

  return tickets.map((row) => {
    const userId = row.user_id as string;
    const base = mapTicket(
      row as Record<string, unknown>,
      messagesByTicket.get(row.id as string)
    );
    return {
      ...base,
      userEmail: emailById.get(userId) ?? "unknown",
      userName: profileById.get(userId) ?? null,
    };
  });
}

export async function replyToSupportTicket(
  ticketId: string,
  body: string
): Promise<void> {
  await requireAdminUser();
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Write a reply before sending.");

  const svc = createServiceClient();

  const { data: ticket } = await svc
    .from("support_tickets")
    .select("id")
    .eq("id", ticketId)
    .maybeSingle();

  if (!ticket) throw new Error("Ticket not found");

  const { error: messageError } = await svc.from("support_messages").insert({
    ticket_id: ticketId,
    sender_role: "admin",
    body: trimmed,
  });

  if (messageError) throw new Error(messageError.message);

  const { error: ticketError } = await svc
    .from("support_tickets")
    .update({ status: "replied" })
    .eq("id", ticketId);

  if (ticketError) throw new Error(ticketError.message);

  revalidatePath("/admin");
  revalidatePath("/messages");
}

export async function closeSupportTicket(ticketId: string): Promise<void> {
  await requireAdminUser();
  const svc = createServiceClient();

  const { error } = await svc
    .from("support_tickets")
    .update({ status: "closed" })
    .eq("id", ticketId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/messages");
}

export async function getAdminOpenSupportCount(): Promise<number> {
  await requireAdminUser();
  const svc = createServiceClient();

  const { count, error } = await svc
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  if (error) return 0;
  return count ?? 0;
}
