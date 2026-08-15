import { aiCallOptions } from "@/lib/ai/context";
import { completeWithFallback } from "@/lib/ai/mock";
import { coverLetterPrompt } from "@/lib/ai/prompts";
import type { PlanTier } from "@/lib/ai/config";

export type CoverLetterAuth = {
  user: { id: string; email?: string | null };
  userName: string;
  positioning: string;
  planTier: PlanTier;
};

export type CoverLetterInput = {
  jobRole: string;
  jobCompany: string;
  jobDesc: string;
  hiringManager?: string;
  summary: string;
  contextNotes?: string;
};

export type CoverLetterResult = {
  letter: string;
  mock: boolean;
};

/** Shared cover-letter generation used by /api/ai/cover-letter and MCP. */
export async function runCoverLetter(
  auth: CoverLetterAuth,
  input: CoverLetterInput
): Promise<CoverLetterResult> {
  const prompt = coverLetterPrompt(
    auth.positioning,
    auth.userName,
    input.jobRole,
    input.jobCompany,
    input.jobDesc,
    input.hiringManager ?? "",
    input.summary,
    input.contextNotes ?? ""
  );
  const { text, mock } = await completeWithFallback(
    prompt,
    aiCallOptions(auth, "cover_letter")
  );
  return { letter: (text || "").trim(), mock };
}
