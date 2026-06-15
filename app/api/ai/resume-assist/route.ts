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
    "apply-suggestion",
  ]),
  data: z.custom<ResumeData>(),
  experienceIndex: z.number().int().min(0).optional(),
  question: z.string().optional(),
  section: z.string().optional(),
  suggestion: z.string().optional(),
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
    const prompt = resumeAssistPrompt({
      positioning: auth.positioning,
      userName: auth.userName,
      action: body.action,
      data: body.data,
      experienceIndex: body.experienceIndex,
      question: body.question,
      sectionId: body.section,
      suggestion: body.suggestion,
    });
    const { text, mock } = await completeWithFallback(prompt);

    // apply-suggestion returns the shape matching the active section.
    const wantsBullets =
      body.action === "polish-bullets" ||
      (body.action === "apply-suggestion" && body.section === "experience");
    const wantsSkills =
      body.action === "suggest-skills" ||
      (body.action === "apply-suggestion" && body.section === "skills");

    if (wantsBullets) {
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

    if (wantsSkills) {
      const parsed = extractJSON(text) as { skills?: string[] } | null;
      return NextResponse.json({
        skills: Array.isArray(parsed?.skills) ? parsed.skills : [],
        mock,
      });
    }

    if (body.action === "improve-headline") {
      const parsed = extractJSON(text) as { options?: string[] } | null;
      const options = Array.isArray(parsed?.options)
        ? parsed.options.map((o) => String(o).trim()).filter(Boolean)
        : (text || "")
            .split("\n")
            .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
            .filter(Boolean);
      return NextResponse.json({ options: options.slice(0, 3), mock });
    }

    if (body.action === "suggest") {
      const parsed = extractJSON(text) as { suggestions?: string[] } | null;
      return NextResponse.json({
        suggestions: Array.isArray(parsed?.suggestions) ? parsed.suggestions : [],
        mock,
      });
    }

    // header apply-suggestion + summary text actions
    if (body.action === "apply-suggestion" && body.section === "header") {
      return NextResponse.json({ headline: (text || "").trim(), mock });
    }

    return NextResponse.json({ text: (text || "").trim(), mock });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
