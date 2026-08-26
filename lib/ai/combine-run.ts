import { aiCallOptions } from "@/lib/ai/context";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import { combineResumesPrompt } from "@/lib/ai/prompts";
import type { PlanTier } from "@/lib/ai/config";
import { normalizeResumeData } from "@/lib/resume/defaults";
import {
  isUsableCombinedResume,
  lockCombinedContact,
  mergeResumeData,
} from "@/lib/resume/merge";
import type { ResumeData } from "@/lib/types/resume";

export type CombineAuth = {
  user: { id: string; email?: string | null };
  userName: string;
  positioning: string;
  planTier: PlanTier;
};

export type CombineResult = {
  data: ResumeData;
  mock: boolean;
};

export async function runCombineResumes(
  auth: CombineAuth,
  input: {
    primary: ResumeData;
    secondary: ResumeData;
    emphasis?: string;
  }
): Promise<CombineResult> {
  const fallback = mergeResumeData(input.primary, input.secondary);
  const prompt = combineResumesPrompt(
    auth.positioning,
    auth.userName,
    normalizeResumeData(input.primary),
    normalizeResumeData(input.secondary),
    input.emphasis ?? ""
  );

  const { text, mock } = await completeWithFallback(
    prompt,
    aiCallOptions(auth, "combine_resumes")
  );

  const parsed = extractJSON<ResumeData>(text);
  const normalized = parsed ? normalizeResumeData(parsed) : null;
  const data = isUsableCombinedResume(normalized)
    ? lockCombinedContact(normalized!, input.primary, input.secondary)
    : fallback;

  return { data, mock };
}
