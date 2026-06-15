import { requireAIUser } from "@/lib/ai/auth";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import { resumeAssistPrompt } from "@/lib/ai/prompts";
import type { ResumeData } from "@/lib/types/resume";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  action: z.enum([
    "improve-summary",
    "improve-headline",
    "polish-bullets",
    "suggest-skills",
    "suggest",
    "ask",
  ]),
  data: z.custom<ResumeData>(),
  experienceIndex: z.number().int().min(0).optional(),
  question: z.string().optional(),
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
    const prompt = resumeAssistPrompt(
      auth.positioning,
      auth.userName,
      body.action,
      body.data,
      body.experienceIndex,
      body.question
    );
    const { text, mock } = await completeWithFallback(prompt);

    if (body.action === "polish-bullets") {
      const parsed = extractJSON(text) as {
        blurb?: string;
        bullets?: string[];
      } | null;
      return NextResponse.json({
        blurb: parsed?.blurb ?? "",
        bullets: Array.isArray(parsed?.bullets) ? parsed.bullets : [],
        mock,
      });
    }

    if (body.action === "suggest-skills") {
      const parsed = extractJSON(text) as { skills?: string[] } | null;
      return NextResponse.json({
        skills: Array.isArray(parsed?.skills) ? parsed.skills : [],
        mock,
      });
    }

    if (body.action === "suggest") {
      const parsed = extractJSON(text) as { suggestions?: string[] } | null;
      return NextResponse.json({
        suggestions: Array.isArray(parsed?.suggestions) ? parsed.suggestions : [],
        mock,
      });
    }

    return NextResponse.json({ text: (text || "").trim(), mock });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
