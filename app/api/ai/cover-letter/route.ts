import { requireAIUser } from "@/lib/ai/auth";
import { aiCallOptions } from "@/lib/ai/context";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { completeWithFallback } from "@/lib/ai/mock";
import { coverLetterPrompt } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  jobRole: z.string(),
  jobCompany: z.string(),
  jobDesc: z.string().min(1),
  hiringManager: z.string().optional(),
  summary: z.string(),
  contextNotes: z.string().optional(),
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
    const prompt = coverLetterPrompt(
      auth.positioning,
      auth.userName,
      body.jobRole,
      body.jobCompany,
      body.jobDesc,
      body.hiringManager ?? "",
      body.summary,
      body.contextNotes ?? ""
    );
    const { text, mock } = await completeWithFallback(
      prompt,
      aiCallOptions(auth, "cover_letter")
    );
    return NextResponse.json({ letter: (text || "").trim(), mock });
  } catch (err) {
    const aiError = aiRouteErrorResponse(err);
    if (aiError) return aiError;
    const message =
      err instanceof Error ? err.message : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
