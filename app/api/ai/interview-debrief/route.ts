import { requireAIUser } from "@/lib/ai/auth";
import { aiCallOptions } from "@/lib/ai/context";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import { interviewDebriefPrompt } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  jobRole: z.string(),
  jobCompany: z.string(),
  jobDesc: z.string(),
  summary: z.string(),
  coverLetter: z.string().optional(),
  prepQuestions: z.array(z.string()).optional(),
  transcript: z.string().min(40, "Paste at least a few lines of transcript"),
  focusNote: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await requireAIUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues[0]?.message ?? "Invalid request body"
        : "Invalid request body";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const prompt = interviewDebriefPrompt(
      auth.positioning,
      auth.userName,
      body.jobRole,
      body.jobCompany,
      body.jobDesc,
      body.summary,
      body.coverLetter ?? "",
      body.prepQuestions ?? [],
      body.transcript,
      body.focusNote
    );
    const { text, mock } = await completeWithFallback(
      prompt,
      aiCallOptions(auth, "interview_debrief")
    );
    const j = extractJSON<{
      summary?: string[];
      landed?: string[];
      gaps?: string[];
      openQuestions?: string[];
      followUpEmail?: string;
      nextRoundPrep?: string[];
    }>(text);

    if (!j || !Array.isArray(j.summary)) {
      return NextResponse.json(
        { error: "Could not analyze the transcript right now. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      debrief: {
        summary: j.summary.map(String),
        landed: Array.isArray(j.landed) ? j.landed.map(String) : [],
        gaps: Array.isArray(j.gaps) ? j.gaps.map(String) : [],
        openQuestions: Array.isArray(j.openQuestions)
          ? j.openQuestions.map(String)
          : [],
        followUpEmail: String(j.followUpEmail ?? ""),
        nextRoundPrep: Array.isArray(j.nextRoundPrep)
          ? j.nextRoundPrep.map(String)
          : [],
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
