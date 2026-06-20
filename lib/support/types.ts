export type SupportCategory = "question" | "feature" | "human_review";

export type SupportTicketStatus = "open" | "replied" | "closed";

export type SupportMessage = {
  id: string;
  ticket_id: string;
  sender_role: "user" | "admin";
  body: string;
  read_by_user_at: string | null;
  created_at: string;
};

export type SupportTicket = {
  id: string;
  user_id: string;
  category: SupportCategory;
  message: string;
  status: SupportTicketStatus;
  created_at: string;
  updated_at: string;
  messages?: SupportMessage[];
  unreadAdminReplies?: number;
};

export type AdminSupportTicket = SupportTicket & {
  userEmail: string;
  userName: string | null;
};
