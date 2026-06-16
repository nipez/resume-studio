export type CoverLetter = {
  id: string;
  title: string;
  role: string;
  company: string;
  body: string;
  resume_version_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CoverLetterSaveResult =
  | { ok: true; letter: CoverLetter }
  | { ok: false; error: string };
