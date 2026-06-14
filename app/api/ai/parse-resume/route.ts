import { requireAIUser } from "@/lib/ai/auth";
import { completeWithFallback, parseResumeFromAI } from "@/lib/ai/mock";
import { parseResumePrompt } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  text: z.string().min(1),
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
    const { text, mock } = await completeWithFallback(
      parseResumePrompt(body.text.trim())
    );
    const data = parseResumeFromAI(text);
    if (!data) {
      return NextResponse.json(
        { error: "Could not parse that resume. Try pasting cleaner text." },
        { status: 422 }
      );
    }
    return NextResponse.json({ data, mock });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
