export type JobDraft = {
  jobRole: string;
  jobCompany: string;
  jobDesc: string;
  jobUrl: string;
  coverText: string;
  coverHM: string;
  contextNotes: string;
};

export const JOB_DRAFT_KEY = "resume_studio_job_draft_v1";

export const EMPTY_JOB_DRAFT: JobDraft = {
  jobRole: "",
  jobCompany: "",
  jobDesc: "",
  jobUrl: "",
  coverText: "",
  coverHM: "",
  contextNotes: "",
};

export function readJobDraft(): JobDraft {
  if (typeof window === "undefined") return EMPTY_JOB_DRAFT;
  try {
    const raw = localStorage.getItem(JOB_DRAFT_KEY);
    if (!raw) return EMPTY_JOB_DRAFT;
    return { ...EMPTY_JOB_DRAFT, ...JSON.parse(raw) };
  } catch {
    return EMPTY_JOB_DRAFT;
  }
}

export function writeJobDraft(patch: Partial<JobDraft>) {
  if (typeof window === "undefined") return;
  const next = { ...readJobDraft(), ...patch };
  localStorage.setItem(JOB_DRAFT_KEY, JSON.stringify(next));
}

export function clearJobDraftLocal() {
  if (typeof window === "undefined") return;
  localStorage.setItem(JOB_DRAFT_KEY, JSON.stringify(EMPTY_JOB_DRAFT));
}

export type QAItem = { id: string; q: string; a: string };

export const QA_DRAFT_KEY = "resume_studio_qa_draft_v1";
export const QA_SCOPE_KEY = "resume_studio_qa_scope_v1";

export function emptyQADraft(): QAItem[] {
  return [{ id: uid(), q: "", a: "" }];
}

export function readQADraft(): QAItem[] {
  if (typeof window === "undefined") return emptyQADraft();
  try {
    const raw = localStorage.getItem(QA_DRAFT_KEY);
    if (!raw) return emptyQADraft();
    const items = JSON.parse(raw) as QAItem[];
    return items.length ? items : emptyQADraft();
  } catch {
    return emptyQADraft();
  }
}

export function writeQADraft(items: QAItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QA_DRAFT_KEY, JSON.stringify(items));
}

export function readQAScope(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(QA_SCOPE_KEY);
  } catch {
    return null;
  }
}

export function writeQAScope(scope: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QA_SCOPE_KEY, scope);
  } catch {
    // ignore
  }
}

export function clearQADraftLocal() {
  if (typeof window === "undefined") return;
  writeQADraft(emptyQADraft());
  try {
    localStorage.removeItem(QA_SCOPE_KEY);
  } catch {
    // ignore
  }
}

/** Stable key so Q&A resets when the job context changes. */
export function qaScopeKey(input: {
  savedJobId?: string | null;
  resultId?: string | null;
  jobRole?: string | null;
  jobCompany?: string | null;
}): string {
  if (input.savedJobId?.trim()) return `saved:${input.savedJobId.trim()}`;
  if (input.resultId?.trim()) return `version:${input.resultId.trim()}`;
  const role = (input.jobRole ?? "").trim().toLowerCase();
  const company = (input.jobCompany ?? "").trim().toLowerCase();
  if (role || company) return `role:${role}|${company}`;
  return "default";
}

export function uid() {
  return "q" + Math.random().toString(36).slice(2, 9);
}
