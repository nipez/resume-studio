import { requireAIUser } from "@/lib/ai/auth";
import { aiCallOptions } from "@/lib/ai/context";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import { resumeAssistPrompt } from "@/lib/ai/prompts";
import type { ResumeData } from "@/lib/types/resume";
import { NextResponse } from "next/server";
import { z } from "zod";

const sectionIdSchema = z.enum([
  "header",
  "summary",
  "skills",
  "experience",
  "education",
]);

const bodySchema = z.object({
  action: z.enum([
    "improve-summary",
    "improve-headline",
    "polish-bullets",
    "suggest-skills",
    "suggest",
    "ask",
    "implement-suggestion",
  ]),
  data: z.custom<ResumeData>(),
  experienceIndex: z.number().int().min(0).optional(),
  question: z.string().optional(),
  suggestion: z.string().optional(),
  sectionId: sectionIdSchema.optional(),
  sectionIndex: z.number().int().min(0).optional(),
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

  const promptText =
    body.action === "implement-suggestion"
      ? body.suggestion
      : body.question;

  try {
    const prompt = resumeAssistPrompt(
      auth.positioning,
      auth.userName,
      body.action,
      body.data,
      body.experienceIndex,
      promptText,
      body.sectionId,
      body.sectionIndex
    );
    const { text, mock } = await completeWithFallback(
      prompt,
      aiCallOptions(auth, "resume_assist")
    );

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

    if (body.action === "improve-headline") {
      const parsed = extractJSON(text) as { headlines?: string[] } | null;
      const headlines = Array.isArray(parsed?.headlines)
        ? parsed.headlines.filter(Boolean).map(String)
        : text.trim()
          ? [text.trim()]
          : [];
      return NextResponse.json({ headlines, mock });
    }

    if (body.action === "suggest") {
      const parsed = extractJSON(text) as { suggestions?: string[] } | null;
      return NextResponse.json({
        suggestions: Array.isArray(parsed?.suggestions) ? parsed.suggestions : [],
        mock,
      });
    }

    if (body.action === "implement-suggestion") {
      const parsed = extractJSON(text) as {
        headline?: string;
        summary?: string;
        skills?: string[];
        experience?: {
          index?: number;
          blurb?: string;
          bullets?: string[];
        };
      } | null;
      return NextResponse.json({
        patch: {
          headline: parsed?.headline,
          summary: parsed?.summary,
          skills: Array.isArray(parsed?.skills) ? parsed.skills : undefined,
          experience: parsed?.experience,
        },
        mock,
      });
    }

    return NextResponse.json({ text: (text || "").trim(), mock });
  } catch (err) {
    const aiError = aiRouteErrorResponse(err);
    if (aiError) return aiError;
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
