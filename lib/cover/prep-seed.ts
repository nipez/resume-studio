"use server";

import { parseJobFromVersionName } from "@/lib/applications/utils";
import type { JobDraft } from "@/lib/job-draft/storage";
import {
  backfillTailoredJobContext,
  getResumeVersion,
} from "@/lib/resume/actions";
import type { TailoredFor } from "@/lib/resume/db-types";
import { getAuthedDb } from "@/lib/auth";

export type CoverPrepSeed = Partial<
  Pick<
    JobDraft,
    "jobRole" | "jobCompany" | "jobDesc" | "jobUrl" | "contextNotes" | "coverText"
  >
>;

function normalizeJobText(value: string | undefined | null): string {
  return value?.trim() ?? "";
}

function companiesMatch(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const left = normalizeJobText(a).toLowerCase();
  const right = normalizeJobText(b).toLowerCase();
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function rolesCompatible(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const left = normalizeJobText(a).toLowerCase();
  const right = normalizeJobText(b).toLowerCase();
  if (!left || !right) return true;
  if (left === right) return true;
  return left.startsWith(right) || right.startsWith(left);
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
  if (seedRole && otherRole && !rolesCompatible(seedRole, otherRole)) {
    return false;
  }
  if (seedCompany && otherCompany && !companiesMatch(seedCompany, otherCompany)) {
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

function applyJobRecord(
  seed: CoverPrepSeed,
  record: {
    role?: string | null;
    company?: string | null;
    job_desc?: string | null;
    job_url?: string | null;
    context_notes?: string | null;
    cover_text?: string | null;
  }
): void {
  if (!seed.jobRole && record.role) seed.jobRole = String(record.role);
  if (!seed.jobCompany && record.company) seed.jobCompany = String(record.company);
  if (!seed.jobDesc?.trim() && record.job_desc) {
    seed.jobDesc = String(record.job_desc);
  }
  if (!seed.jobUrl?.trim() && record.job_url) {
    seed.jobUrl = String(record.job_url);
  }
  if (!seed.contextNotes?.trim() && record.context_notes) {
    seed.contextNotes = String(record.context_notes);
  }
  if (!seed.coverText?.trim() && record.cover_text) {
    seed.coverText = String(record.cover_text);
  }
}

async function maybeBackfillVersion(
  versionId: string,
  tailoredFor: TailoredFor,
  seed: CoverPrepSeed
): Promise<void> {
  if (!tailoredFor || tailoredFor.jobDesc?.trim() || !seed.jobDesc?.trim()) return;
  await backfillTailoredJobContext(versionId, {
    jobDesc: seed.jobDesc,
    jobUrl: seed.jobUrl,
    contextNotes: seed.contextNotes,
  });
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

  const { supabase, userId } = await getAuthedDb();

  const { data: savedJobByVersion } = await supabase
    .from("saved_jobs")
    .select("role, company, job_desc, job_url, context_notes, cover_text")
    .eq("user_id", userId)
    .eq("tailored_version_id", versionId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (savedJobByVersion) applyJobRecord(seed, savedJobByVersion);

  if (!seed.jobDesc?.trim()) {
    const { data: application } = await supabase
      .from("applications")
      .select("role, company, job_desc")
      .eq("user_id", userId)
      .eq("resume_version_id", versionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (application) applyJobRecord(seed, application);
  }

  const { data: workspaceDraft } = await supabase
    .from("workspace_drafts")
    .select("job_role, job_company, job_desc, job_url, context_notes, cover_text")
    .eq("user_id", userId)
    .maybeSingle();

  if (!seed.jobDesc?.trim() && workspaceDraft?.job_desc) {
    const company = seed.jobCompany || version.tailored_for?.company;
    const companyMatches = companiesMatch(workspaceDraft.job_company, company);
    const contextMatches = jobContextMatches(
      seed,
      workspaceDraft.job_role,
      workspaceDraft.job_company
    );

    if (companyMatches || contextMatches || !version.tailored_for) {
      applyJobRecord(seed, {
        role: workspaceDraft.job_role,
        company: workspaceDraft.job_company,
        job_desc: workspaceDraft.job_desc,
        job_url: workspaceDraft.job_url,
        context_notes: workspaceDraft.context_notes,
        cover_text: workspaceDraft.cover_text,
      });
    }
  }

  if (!seed.jobDesc?.trim() && seed.jobCompany) {
    const { data: savedJobByCompany } = await supabase
      .from("saved_jobs")
      .select("role, company, job_desc, job_url, context_notes, cover_text")
      .eq("user_id", userId)
      .ilike("company", `%${seed.jobCompany}%`)
      .neq("job_desc", "")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      savedJobByCompany &&
      rolesCompatible(seed.jobRole, savedJobByCompany.role)
    ) {
      applyJobRecord(seed, savedJobByCompany);
    }
  }

  if (!seed.jobDesc?.trim() && seed.jobRole && seed.jobCompany) {
    const { data: savedJobExact } = await supabase
      .from("saved_jobs")
      .select("role, company, job_desc, job_url, context_notes, cover_text")
      .eq("user_id", userId)
      .ilike("role", seed.jobRole)
      .ilike("company", seed.jobCompany)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (savedJobExact) applyJobRecord(seed, savedJobExact);
  }

  await maybeBackfillVersion(versionId, version.tailored_for, seed);

  return Object.keys(seed).length ? seed : null;
}
