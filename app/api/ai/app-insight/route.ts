import { requireAIUser } from "@/lib/ai/auth";
import { aiCallOptions } from "@/lib/ai/context";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import { appInsightPrompt } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  jobRole: z.string(),
  jobCompany: z.string(),
  jobDesc: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  coverLetter: z.string(),
});

export async function POST(request: Request) {
  const auth = await requireAIUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const prompt = appInsightPrompt(
      auth.positioning,
      auth.userName,
      body.jobRole,
      body.jobCompany,
      body.jobDesc,
      body.summary,
      body.skills,
      body.coverLetter
    );
    const { text, mock } = await completeWithFallback(
      prompt,
      aiCallOptions(auth, "app_insight")
    );
    const j = extractJSON<{
      fitScore?: number;
      strengths?: string[];
      gaps?: string[];
      advice?: string;
    }>(text);

    if (!j || typeof j.fitScore !== "number") {
      return NextResponse.json(
        { error: "Could not analyze right now. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      insight: {
        fitScore: Math.round(j.fitScore),
        strengths: Array.isArray(j.strengths) ? j.strengths.map(String) : [],
        gaps: Array.isArray(j.gaps) ? j.gaps.map(String) : [],
        advice: String(j.advice ?? ""),
      },
      mock,
    });
  } catch (err) {
    const aiError = aiRouteErrorResponse(err);
    if (aiError) return aiError;
    const message =
      err instanceof Error ? err.message : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
