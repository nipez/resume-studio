import type { ResumeData, TemplateStyle } from "@/lib/types/resume";

export type TailoredFor = {
  role?: string;
  company?: string;
  depth?: string;
  jobDesc?: string;
  jobUrl?: string;
  contextNotes?: string;
} | null;

export type ResumeVersion = {
  id: string;
  user_id: string;
  name: string;
  template_style: TemplateStyle;
  tailored_for: TailoredFor;
  data: ResumeData;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};
