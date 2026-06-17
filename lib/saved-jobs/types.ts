export type SavedJob = {
  id: string;
  user_id: string;
  role: string;
  company: string;
  job_desc: string;
  job_url: string;
  context_notes: string;
  notes: string;
  tailored_version_id: string | null;
  cover_text: string;
  created_at: string;
  updated_at: string;
};

export type CreateSavedJobInput = {
  role?: string;
  company?: string;
  jobDesc?: string;
  jobUrl?: string;
  contextNotes?: string;
  notes?: string;
};

export type UpdateSavedJobInput = {
  role?: string;
  company?: string;
  jobDesc?: string;
  jobUrl?: string;
  contextNotes?: string;
  notes?: string;
  tailoredVersionId?: string | null;
  coverText?: string;
};
