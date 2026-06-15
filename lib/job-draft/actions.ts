"use server";

import type { JobDraft, QAItem } from "@/lib/job-draft/storage";
import { EMPTY_JOB_DRAFT } from "@/lib/job-draft/storage";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceDraft = {
  draft: JobDraft;
  qa: QAItem[];
};

export async function loadWorkspaceDraft(): Promise<WorkspaceDraft | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("workspace_drafts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    draft: {
      jobRole: (data.job_role as string) ?? "",
      jobCompany: (data.job_company as string) ?? "",
      jobDesc: (data.job_desc as string) ?? "",
      jobUrl: (data.job_url as string) ?? "",
      coverText: (data.cover_text as string) ?? "",
      coverHM: (data.cover_hm as string) ?? "",
    },
    qa: Array.isArray(data.qa) ? (data.qa as QAItem[]) : [],
  };
}

// Upsert only the job-context columns; the partial payload leaves the qa column
// untouched on conflict (PostgREST only updates the columns it is given).
export async function saveJobDraft(draft: Partial<JobDraft>): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const merged = { ...EMPTY_JOB_DRAFT, ...draft };

  await supabase.from("workspace_drafts").upsert(
    {
      user_id: user.id,
      job_role: merged.jobRole,
      job_company: merged.jobCompany,
      job_desc: merged.jobDesc,
      job_url: merged.jobUrl,
      cover_text: merged.coverText,
      cover_hm: merged.coverHM,
    },
    { onConflict: "user_id" }
  );
}

export async function saveQADraft(qa: QAItem[]): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("workspace_drafts")
    .upsert({ user_id: user.id, qa }, { onConflict: "user_id" });
}
