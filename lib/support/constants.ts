import type { SupportCategory, SupportTicketStatus } from "@/lib/support/types";

export const SUPPORT_CATEGORIES: {
  id: SupportCategory;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "question",
    label: "Ask a question",
    description: "Stuck on building, tailoring, or tracking? We'll help.",
    icon: "?",
  },
  {
    id: "feature",
    label: "Request a feature",
    description: "Tell us what would make ResumeTrakr better for you.",
    icon: "✦",
  },
  {
    id: "human_review",
    label: "Human resume review",
    description: "Want a real person to review your resume? Request a consult.",
    icon: "👤",
  },
];

export const SUPPORT_CATEGORY_LABEL: Record<SupportCategory, string> = {
  question: "Question",
  feature: "Feature request",
  human_review: "Human review",
};

export const SUPPORT_STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open: "Waiting for reply",
  replied: "Replied",
  closed: "Closed",
};

export function supportStatusTone(status: SupportTicketStatus): {
  bg: string;
  fg: string;
  bd: string;
} {
  switch (status) {
    case "replied":
      return { bg: "#E6F7EE", fg: "#0E7C4B", bd: "#BFE8D1" };
    case "closed":
      return { bg: "#F2F3F5", fg: "#5A6573", bd: "#E2E5EA" };
    default:
      return { bg: "#EEF3FF", fg: "#1E54E6", bd: "#C8D8FF" };
  }
}
