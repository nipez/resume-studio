import { requireAIUser } from "@/lib/ai/auth";
import { aiCallOptions } from "@/lib/ai/context";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import { interviewPrepPrompt } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  jobRole: z.string(),
  jobCompany: z.string(),
  jobDesc: z.string(),
  summary: z.string(),
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
    const prompt = interviewPrepPrompt(
      auth.positioning,
      auth.userName,
      body.jobRole,
      body.jobCompany,
      body.jobDesc,
      body.summary
    );
    const { text, mock } = await completeWithFallback(
      prompt,
      aiCallOptions(auth, "interview_prep")
    );
    const j = extractJSON<{
      questions?: string[];
      talkingPoints?: string[];
      ask?: string[];
    }>(text);

    if (!j || !Array.isArray(j.questions)) {
      return NextResponse.json(
        { error: "Could not generate prep right now. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      prep: {
        questions: j.questions.map(String),
        talkingPoints: Array.isArray(j.talkingPoints)
          ? j.talkingPoints.map(String)
          : [],
        ask: Array.isArray(j.ask) ? j.ask.map(String) : [],
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
