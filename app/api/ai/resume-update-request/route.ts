import { requireAIUser } from "@/lib/ai/auth";
import { aiCallOptions } from "@/lib/ai/context";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback, parseResumeFromAI } from "@/lib/ai/mock";
import { applyResumeUpdateRequestPrompt } from "@/lib/ai/prompts";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { normalizeResumeData } from "@/lib/resume/defaults";
import type { ResumeData } from "@/lib/types/resume";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  data: z.custom<ResumeData>(),
  updateRequest: z.string().trim().min(1).max(4000),
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
    const prompt = applyResumeUpdateRequestPrompt(
      auth.positioning,
      auth.userName,
      body.data,
      body.updateRequest,
      auth.systemGuidelines
    );
    const { text, mock } = await completeWithFallback(
      prompt,
      aiCallOptions(auth, "apply_resume_context")
    );
    const parsed =
      parseResumeFromAI(text) ||
      normalizeResumeData(extractJSON<ResumeData>(text) ?? body.data);

    return NextResponse.json({
      data: normalizeResumeData({
        ...body.data,
        ...parsed,
        name: body.data.name || parsed.name,
        email: body.data.email || parsed.email,
        phone: body.data.phone || parsed.phone,
      }),
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
