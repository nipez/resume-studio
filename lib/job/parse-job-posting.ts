import { completeWithFallback, parseJobPostingFromAI } from "@/lib/ai/mock";
import { parseJobPostingPrompt } from "@/lib/ai/prompts";
import type { PlanTier } from "@/lib/ai/config";

export async function parseJobPostingText(
  pageText: string,
  sourceUrl: string | undefined,
  aiContext: { userId: string; planTier: PlanTier }
) {
  const trimmed = pageText.trim();
  if (trimmed.length < 80) {
    throw new Error(
      "Not enough text to parse. Paste the full job description from the posting."
    );
  }

  const { text, mock } = await completeWithFallback(
    parseJobPostingPrompt(trimmed.slice(0, 30_000), sourceUrl),
    {
      userId: aiContext.userId,
      planTier: aiContext.planTier,
      action: "job_parse",
    }
  );
  const parsed = parseJobPostingFromAI(text);
  if (!parsed) {
    throw new Error(
      "Could not parse that job posting. Try pasting more of the description."
    );
  }

  return { ...parsed, mock };
}
