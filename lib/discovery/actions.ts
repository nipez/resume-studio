"use server";

import { getAuthedDb } from "@/lib/auth";
import { createSavedJob } from "@/lib/saved-jobs/actions";
import type { SavedJob } from "@/lib/saved-jobs/types";
import type {
  DiscoveryCriteria,
  DiscoveryTarget,
  JobSearchProfile,
  SaveDiscoveryProfileInput,
} from "@/lib/discovery/types";
import { EMPTY_DISCOVERY_CRITERIA } from "@/lib/discovery/types";
import { revalidatePath } from "next/cache";

function isMissingTableError(message: string): boolean {
  return message.toLowerCase().includes("job_search_profiles");
}

function normalizeCriteria(raw: unknown): DiscoveryCriteria {
  const data =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    name: String(data.name ?? ""),
    roleTitles: String(data.roleTitles ?? ""),
    location: String(data.location ?? ""),
    industry: String(data.industry ?? ""),
    companySize: String(data.companySize ?? ""),
    keywords: String(data.keywords ?? ""),
    territoryNotes: String(data.territoryNotes ?? ""),
    mustHave: String(data.mustHave ?? ""),
    exclude: String(data.exclude ?? ""),
  };
}

function mapProfile(row: Record<string, unknown>): JobSearchProfile {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: String(row.name ?? ""),
    criteria: normalizeCriteria(row.criteria),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function getJobSearchProfiles(): Promise<JobSearchProfile[]> {
  const { supabase, userId } = await getAuthedDb();

  const { data, error } = await supabase
    .from("job_search_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProfile);
}

export async function saveJobSearchProfile(
  input: SaveDiscoveryProfileInput
): Promise<JobSearchProfile> {
  const { supabase, userId } = await getAuthedDb();
  const criteria = input.criteria ?? EMPTY_DISCOVERY_CRITERIA;
  const name =
    criteria.name.trim() ||
    criteria.roleTitles.trim() ||
    criteria.location.trim() ||
    "Target search";

  const payload = {
    name,
    criteria,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("job_search_profiles")
      .update(payload)
      .eq("id", input.id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error || !data) {
      if (error && isMissingTableError(error.message)) {
        throw new Error(
          "Job Discovery is not enabled yet — run migration 0018_job_discovery.sql in Supabase."
        );
      }
      throw new Error(error?.message ?? "Failed to update search profile");
    }

    revalidatePath("/discover");
    return mapProfile(data);
  }

  const { data, error } = await supabase
    .from("job_search_profiles")
    .insert({
      user_id: userId,
      ...payload,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error && isMissingTableError(error.message)) {
      throw new Error(
        "Job Discovery is not enabled yet — run migration 0018_job_discovery.sql in Supabase."
      );
    }
    throw new Error(error?.message ?? "Failed to save search profile");
  }

  revalidatePath("/discover");
  return mapProfile(data);
}

export async function deleteJobSearchProfile(id: string): Promise<void> {
  const { supabase, userId } = await getAuthedDb();
  const { error } = await supabase
    .from("job_search_profiles")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    if (isMissingTableError(error.message)) return;
    throw new Error(error.message);
  }

  revalidatePath("/discover");
}

function formatDiscoveryNotes(target: DiscoveryTarget): string {
  const lines = [
    `Discovery target (${target.priority} priority)`,
    target.rationale,
    "",
    "Research checklist:",
    ...target.researchSteps.map((step) => `- ${step}`),
  ];
  if (target.linkedinSearch.trim()) {
    lines.push("", `LinkedIn search: ${target.linkedinSearch.trim()}`);
  }
  if (target.careersHint.trim()) {
    lines.push(`Careers page: ${target.careersHint.trim()}`);
  }
  return lines.join("\n");
}

export async function saveDiscoveryTargetToQueue(
  target: DiscoveryTarget
): Promise<SavedJob> {
  const role = target.role.trim() || "Open role";
  const company = target.company.trim();
  if (!company) {
    throw new Error("Company name is required to save this target.");
  }

  return createSavedJob({
    role,
    company,
    notes: formatDiscoveryNotes(target),
    contextNotes: target.rationale,
  });
}
