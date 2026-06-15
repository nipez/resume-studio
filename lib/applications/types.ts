import type { ResumeData, TemplateStyle } from "@/lib/types/resume";

export type ApplicationStatus =
  | "applied"
  | "response"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";

export type EventType = "interview" | "followup" | "note";

export type ResumeSnapshot = {
  name: string;
  template_style: TemplateStyle;
  data: ResumeData;
};

export type ApplicationAnswer = { q: string; a: string };

export type StatusHistoryEntry = {
  status: ApplicationStatus;
  at: string;
};

export type AppInsight = {
  fitScore: number;
  strengths: string[];
  gaps: string[];
  advice: string;
};

export type AppPrep = {
  questions: string[];
  talkingPoints: string[];
  ask: string[];
};

export type HiringContact = {
  name: string;
  title: string;
  rationale: string;
  confidence: "high" | "medium" | "low";
};

export type ApplicationEvent = {
  id: string;
  application_id: string;
  user_id: string;
  type: EventType;
  title: string;
  date: string | null;
  time: string;
  notes: string;
  done: boolean;
  created_at: string;
};

export type Application = {
  id: string;
  user_id: string;
  role: string;
  company: string;
  job_desc: string;
  job_url: string;
  applied_at: string;
  resume_version_id: string | null;
  resume_version_name: string | null;
  resume_snapshot: ResumeSnapshot;
  cover_letter: string;
  answers: ApplicationAnswer[];
  status: ApplicationStatus;
  status_history: StatusHistoryEntry[];
  insight: AppInsight | null;
  prep: AppPrep | null;
  hiring_contacts: HiringContact[] | null;
  notes: string;
  created_at: string;
  events?: ApplicationEvent[];
};

export type LogApplicationInput = {
  versionId: string;
  role?: string;
  company?: string;
  jobDesc?: string;
  jobUrl?: string;
  coverLetter?: string;
  answers?: ApplicationAnswer[];
};
