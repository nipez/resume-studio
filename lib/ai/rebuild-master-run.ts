import { aiCallOptions } from "@/lib/ai/context";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import { rebuildMasterPrompt } from "@/lib/ai/prompts";
import type { PlanTier } from "@/lib/ai/config";
import type { SystemGuidelines } from "@/lib/ai/system-guidelines";
import { normalizeResumeData } from "@/lib/resume/defaults";
import {
  isUsableCombinedResume,
  mergeResumeData,
} from "@/lib/resume/merge";
import type { ResumeData } from "@/lib/types/resume";

export type RebuildMasterAuth = {
  user: { id: string; email?: string | null };
  userName: string;
  positioning: string;
  planTier: PlanTier;
  systemGuidelines: SystemGuidelines;
};

export type RebuildMasterResult = {
  data: ResumeData;
  mock: boolean;
};

function lockMasterContact(
  combined: ResumeData,
  primary: ResumeData
): ResumeData {
  const primaryNorm = normalizeResumeData(primary);
  return normalizeResumeData({
    ...combined,
    name: primaryNorm.name,
    phone: primaryNorm.phone,
    email: primaryNorm.email,
    location: primaryNorm.location,
    linkedin: primaryNorm.linkedin,
  });
}

function deterministicRebuildMaster(
  primary: ResumeData,
  secondaries: ResumeData[]
): ResumeData {
  return secondaries.reduce(
    (acc, secondary) => mergeResumeData(acc, secondary),
    normalizeResumeData(primary)
  );
}

export async function runRebuildMaster(
  auth: RebuildMasterAuth,
  input: {
    primary: ResumeData;
    secondaries: ResumeData[];
  }
): Promise<RebuildMasterResult> {
  const primary = normalizeResumeData(input.primary);
  const secondaries = input.secondaries.map((item) => normalizeResumeData(item));
  const fallback = deterministicRebuildMaster(primary, secondaries);

  const prompt = rebuildMasterPrompt(
    auth.positioning,
    auth.userName,
    primary,
    secondaries,
    auth.systemGuidelines
  );

  const { text, mock } = await completeWithFallback(
    prompt,
    aiCallOptions(auth, "combine_resumes")
  );

  const parsed = extractJSON<ResumeData>(text);
  const normalized = parsed ? normalizeResumeData(parsed) : null;
  const data = isUsableCombinedResume(normalized)
    ? lockMasterContact(normalized!, primary)
    : fallback;

  return { data, mock };
}
