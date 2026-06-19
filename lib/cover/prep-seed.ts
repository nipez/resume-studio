"use server";

import { parseJobFromVersionName } from "@/lib/applications/utils";
import type { JobDraft } from "@/lib/job-draft/storage";
import { getResumeVersion } from "@/lib/resume/actions";
import { createClient } from "@/lib/supabase/server";

export type CoverPrepSeed = Partial<
  Pick<
    JobDraft,
    "jobRole" | "jobCompany" | "jobDesc" | "jobUrl" | "contextNotes" | "coverText"
  >
>;

/** Job context to pre-fill Cover when opening from a resume version. */
export async function getCoverPrepSeedForVersion(
  versionId: string
): Promise<CoverPrepSeed | null> {
  const version = await getResumeVersion(versionId);
  if (!version) return null;

  const seed: CoverPrepSeed = {};

  if (version.tailored_for?.role?.trim()) {
    seed.jobRole = version.tailored_for.role.trim();
  }
  if (version.tailored_for?.company?.trim()) {
    seed.jobCompany = version.tailored_for.company.trim();
  }

  if (!seed.jobRole || !seed.jobCompany) {
    const fromName = parseJobFromVersionName(version.name);
    if (!seed.jobRole && fromName.role) seed.jobRole = fromName.role;
    if (!seed.jobCompany && fromName.company) seed.jobCompany = fromName.company;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Object.keys(seed).length ? seed : null;

  const { data: savedJob } = await supabase
    .from("saved_jobs")
    .select("role, company, job_desc, job_url, context_notes, cover_text")
    .eq("user_id", user.id)
    .eq("tailored_version_id", versionId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (savedJob) {
    if (!seed.jobRole && savedJob.role) seed.jobRole = String(savedJob.role);
    if (!seed.jobCompany && savedJob.company) {
      seed.jobCompany = String(savedJob.company);
    }
    if (savedJob.job_desc) seed.jobDesc = String(savedJob.job_desc);
    if (savedJob.job_url) seed.jobUrl = String(savedJob.job_url);
    if (savedJob.context_notes) seed.contextNotes = String(savedJob.context_notes);
    if (savedJob.cover_text) seed.coverText = String(savedJob.cover_text);
  }

  if (!seed.jobDesc?.trim()) {
    const { data: application } = await supabase
      .from("applications")
      .select("role, company, job_desc")
      .eq("user_id", user.id)
      .eq("resume_version_id", versionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (application) {
      if (!seed.jobRole && application.role) seed.jobRole = String(application.role);
      if (!seed.jobCompany && application.company) {
        seed.jobCompany = String(application.company);
      }
      if (application.job_desc) seed.jobDesc = String(application.job_desc);
    }
  }

  return Object.keys(seed).length ? seed : null;
}
