"use server";

import { saveJobDraft } from "@/lib/job-draft/actions";
import type { JobDraft } from "@/lib/job-draft/storage";
import type {
  CreateSavedJobInput,
  SavedJob,
  UpdateSavedJobInput,
} from "@/lib/saved-jobs/types";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function mapSavedJob(row: Record<string, unknown>): SavedJob {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    role: String(row.role ?? ""),
    company: String(row.company ?? ""),
    job_desc: String(row.job_desc ?? ""),
    job_url: String(row.job_url ?? ""),
    context_notes: String(row.context_notes ?? ""),
    notes: String(row.notes ?? ""),
    tailored_version_id: (row.tailored_version_id as string | null) ?? null,
    cover_text: String(row.cover_text ?? ""),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function getSavedJobsList(): Promise<SavedJob[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    if (error.message.toLowerCase().includes("saved_jobs")) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map(mapSavedJob);
}

export async function getSavedJob(id: string): Promise<SavedJob | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapSavedJob(data);
}

export async function createSavedJob(
  input: CreateSavedJobInput
): Promise<SavedJob> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const role = input.role?.trim() ?? "";
  const company = input.company?.trim() ?? "";
  if (!role && !company) {
    throw new Error("Enter a role or company so you can find this job later.");
  }

  const { data, error } = await supabase
    .from("saved_jobs")
    .insert({
      user_id: user.id,
      role,
      company,
      job_desc: input.jobDesc?.trim() ?? "",
      job_url: input.jobUrl?.trim() ?? "",
      context_notes: input.contextNotes?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to save job");

  revalidatePath("/applications");
  return mapSavedJob(data);
}

export async function updateSavedJob(
  id: string,
  input: UpdateSavedJobInput
): Promise<SavedJob> {
  const supabase = createClient();
  const payload: Record<string, unknown> = {};
  if (input.role !== undefined) payload.role = input.role.trim();
  if (input.company !== undefined) payload.company = input.company.trim();
  if (input.jobDesc !== undefined) payload.job_desc = input.jobDesc.trim();
  if (input.jobUrl !== undefined) payload.job_url = input.jobUrl.trim();
  if (input.contextNotes !== undefined) payload.context_notes = input.contextNotes.trim();
  if (input.notes !== undefined) payload.notes = input.notes.trim();
  if (input.tailoredVersionId !== undefined) {
    payload.tailored_version_id = input.tailoredVersionId;
  }
  if (input.coverText !== undefined) payload.cover_text = input.coverText;

  const { data, error } = await supabase
    .from("saved_jobs")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update job");

  revalidatePath("/applications");
  return mapSavedJob(data);
}

export async function deleteSavedJob(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("saved_jobs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/applications");
}

function savedJobToDraft(job: SavedJob): JobDraft {
  return {
    jobRole: job.role,
    jobCompany: job.company,
    jobDesc: job.job_desc,
    jobUrl: job.job_url,
    contextNotes: job.context_notes,
    coverText: job.cover_text,
    coverHM: "",
  };
}

/** Load a saved job into the shared workspace draft for Tailor/Cover/Q&A prep. */
export async function activateSavedJobForPrep(
  id: string
): Promise<JobDraft | null> {
  const job = await getSavedJob(id);
  if (!job) return null;

  const draft = savedJobToDraft(job);
  await saveJobDraft(draft);
  revalidatePath("/tailor");
  revalidatePath("/cover");
  revalidatePath("/questions");
  return draft;
}
