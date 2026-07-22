"use server";

import type { JobDraft, QAItem } from "@/lib/job-draft/storage";
import { EMPTY_JOB_DRAFT } from "@/lib/job-draft/storage";
import { getAuthedDb } from "@/lib/auth";

export type WorkspaceDraft = {
  draft: JobDraft;
  qa: QAItem[];
};

export async function loadWorkspaceDraft(): Promise<WorkspaceDraft | null> {
  const { supabase, userId } = await getAuthedDb();

  const { data } = await supabase
    .from("workspace_drafts")
    .select("*")
    .eq("user_id", userId)
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
      contextNotes: (data.context_notes as string) ?? "",
    },
    qa: Array.isArray(data.qa) ? (data.qa as QAItem[]) : [],
  };
}

// Upsert only the job-context columns; the partial payload leaves the qa column
// untouched on conflict (PostgREST only updates the columns it is given).
export async function saveJobDraft(draft: Partial<JobDraft>): Promise<void> {
  const { supabase, userId } = await getAuthedDb();

  const merged = { ...EMPTY_JOB_DRAFT, ...draft };

  await supabase.from("workspace_drafts").upsert(
    {
      user_id: userId,
      job_role: merged.jobRole,
      job_company: merged.jobCompany,
      job_desc: merged.jobDesc,
      job_url: merged.jobUrl,
      cover_text: merged.coverText,
      cover_hm: merged.coverHM,
      context_notes: merged.contextNotes,
    },
    { onConflict: "user_id" }
  );
}

export async function clearWorkspaceJobDraft(): Promise<void> {
  const { supabase, userId } = await getAuthedDb();

  await supabase.from("workspace_drafts").upsert(
    {
      user_id: userId,
      job_role: "",
      job_company: "",
      job_desc: "",
      job_url: "",
      cover_text: "",
      cover_hm: "",
      context_notes: "",
      qa: [],
    },
    { onConflict: "user_id" }
  );
}

export async function saveQADraft(qa: QAItem[]): Promise<void> {
  const { supabase, userId } = await getAuthedDb();

  await supabase
    .from("workspace_drafts")
    .upsert({ user_id: userId, qa }, { onConflict: "user_id" });
}

export async function clearWorkspaceQADraft(): Promise<void> {
  await saveQADraft([]);
}
