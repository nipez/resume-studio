"use server";

import { parseJobFromVersionName } from "@/lib/applications/utils";
import type { JobDraft } from "@/lib/job-draft/storage";
import { getResumeVersion } from "@/lib/resume/actions";
import type { TailoredFor } from "@/lib/resume/db-types";
import { createClient } from "@/lib/supabase/server";

export type CoverPrepSeed = Partial<
  Pick<
    JobDraft,
    "jobRole" | "jobCompany" | "jobDesc" | "jobUrl" | "contextNotes" | "coverText"
  >
>;

function normalizeJobText(value: string | undefined | null): string {
  return value?.trim() ?? "";
}

function jobContextMatches(
  seed: CoverPrepSeed,
  role: string | null | undefined,
  company: string | null | undefined
): boolean {
  const seedRole = normalizeJobText(seed.jobRole);
  const seedCompany = normalizeJobText(seed.jobCompany);
  const otherRole = normalizeJobText(role);
  const otherCompany = normalizeJobText(company);

  if (!seedRole && !seedCompany) return true;
  if (seedRole && otherRole && seedRole.toLowerCase() !== otherRole.toLowerCase()) {
    return false;
  }
  if (
    seedCompany &&
    otherCompany &&
    seedCompany.toLowerCase() !== otherCompany.toLowerCase()
  ) {
    return false;
  }
  return true;
}

function applyTailoredFor(seed: CoverPrepSeed, tailoredFor: TailoredFor): void {
  if (!tailoredFor) return;
  if (!seed.jobRole && tailoredFor.role?.trim()) seed.jobRole = tailoredFor.role.trim();
  if (!seed.jobCompany && tailoredFor.company?.trim()) {
    seed.jobCompany = tailoredFor.company.trim();
  }
  if (!seed.jobDesc?.trim() && tailoredFor.jobDesc?.trim()) {
    seed.jobDesc = tailoredFor.jobDesc.trim();
  }
  if (!seed.jobUrl?.trim() && tailoredFor.jobUrl?.trim()) {
    seed.jobUrl = tailoredFor.jobUrl.trim();
  }
  if (!seed.contextNotes?.trim() && tailoredFor.contextNotes?.trim()) {
    seed.contextNotes = tailoredFor.contextNotes.trim();
  }
}

/** Job context to pre-fill Cover when opening from a resume version. */
export async function getCoverPrepSeedForVersion(
  versionId: string
): Promise<CoverPrepSeed | null> {
  const version = await getResumeVersion(versionId);
  if (!version) return null;

  const seed: CoverPrepSeed = {};
  applyTailoredFor(seed, version.tailored_for);

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
    if (!seed.jobDesc?.trim() && savedJob.job_desc) {
      seed.jobDesc = String(savedJob.job_desc);
    }
    if (!seed.jobUrl?.trim() && savedJob.job_url) {
      seed.jobUrl = String(savedJob.job_url);
    }
    if (!seed.contextNotes?.trim() && savedJob.context_notes) {
      seed.contextNotes = String(savedJob.context_notes);
    }
    if (!seed.coverText?.trim() && savedJob.cover_text) {
      seed.coverText = String(savedJob.cover_text);
    }
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

  if (!seed.jobDesc?.trim()) {
    const { data: workspaceDraft } = await supabase
      .from("workspace_drafts")
      .select("job_role, job_company, job_desc, job_url, context_notes, cover_text")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      workspaceDraft?.job_desc &&
      jobContextMatches(seed, workspaceDraft.job_role, workspaceDraft.job_company)
    ) {
      seed.jobDesc = String(workspaceDraft.job_desc);
      if (!seed.jobUrl?.trim() && workspaceDraft.job_url) {
        seed.jobUrl = String(workspaceDraft.job_url);
      }
      if (!seed.contextNotes?.trim() && workspaceDraft.context_notes) {
        seed.contextNotes = String(workspaceDraft.context_notes);
      }
      if (!seed.coverText?.trim() && workspaceDraft.cover_text) {
        seed.coverText = String(workspaceDraft.cover_text);
      }
    }
  }

  if (!seed.jobDesc?.trim() && seed.jobRole && seed.jobCompany) {
    const { data: matchedJob } = await supabase
      .from("saved_jobs")
      .select("job_desc, job_url, context_notes, cover_text")
      .eq("user_id", user.id)
      .ilike("role", seed.jobRole)
      .ilike("company", seed.jobCompany)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (matchedJob?.job_desc) {
      seed.jobDesc = String(matchedJob.job_desc);
      if (!seed.jobUrl?.trim() && matchedJob.job_url) {
        seed.jobUrl = String(matchedJob.job_url);
      }
      if (!seed.contextNotes?.trim() && matchedJob.context_notes) {
        seed.contextNotes = String(matchedJob.context_notes);
      }
      if (!seed.coverText?.trim() && matchedJob.cover_text) {
        seed.coverText = String(matchedJob.cover_text);
      }
    }
  }

  return Object.keys(seed).length ? seed : null;
}
