import { requireAIUser } from "@/lib/ai/auth";
import { aiCallOptions } from "@/lib/ai/context";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback, parseResumeFromAI } from "@/lib/ai/mock";
import { applyResumeContextPrompt } from "@/lib/ai/prompts";
import { normalizeResumeData } from "@/lib/resume/defaults";
import type { ResumeData } from "@/lib/types/resume";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  data: z.custom<ResumeData>(),
  contextNotes: z.string().min(1),
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

  const { userName, positioning } = auth;
  const { data, contextNotes } = body;

  try {
    const prompt = applyResumeContextPrompt(
      positioning,
      userName,
      data,
      contextNotes
    );
    const { text, mock } = await completeWithFallback(
      prompt,
      aiCallOptions(auth, "apply_resume_context")
    );
    const parsed =
      parseResumeFromAI(text) ||
      normalizeResumeData(extractJSON<ResumeData>(text) ?? data);

    return NextResponse.json({
      data: normalizeResumeData({
        ...data,
        ...parsed,
        name: data.name || parsed.name,
        email: data.email || parsed.email,
        phone: data.phone || parsed.phone,
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
