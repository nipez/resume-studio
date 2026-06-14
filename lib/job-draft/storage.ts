export type JobDraft = {
  jobRole: string;
  jobCompany: string;
  jobDesc: string;
  coverText: string;
  coverHM: string;
};

export const JOB_DRAFT_KEY = "resume_studio_job_draft_v1";

export const EMPTY_JOB_DRAFT: JobDraft = {
  jobRole: "",
  jobCompany: "",
  jobDesc: "",
  coverText: "",
  coverHM: "",
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

export type QAItem = { id: string; q: string; a: string };

export const QA_DRAFT_KEY = "resume_studio_qa_draft_v1";

export function readQADraft(): QAItem[] {
  if (typeof window === "undefined") return [{ id: uid(), q: "", a: "" }];
  try {
    const raw = localStorage.getItem(QA_DRAFT_KEY);
    if (!raw) return [{ id: uid(), q: "", a: "" }];
    const items = JSON.parse(raw) as QAItem[];
    return items.length ? items : [{ id: uid(), q: "", a: "" }];
  } catch {
    return [{ id: uid(), q: "", a: "" }];
  }
}

export function writeQADraft(items: QAItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(QA_DRAFT_KEY, JSON.stringify(items));
}

export function uid() {
  return "q" + Math.random().toString(36).slice(2, 9);
}
