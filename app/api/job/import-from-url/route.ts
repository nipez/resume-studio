import { requireAIUser } from "@/lib/ai/auth";
import { completeWithFallback, parseJobPostingFromAI } from "@/lib/ai/mock";
import { parseJobPostingPrompt } from "@/lib/ai/prompts";
import { fetchJobPageText } from "@/lib/job/fetch-job-url";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  url: z.string().url().max(2048),
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
    return NextResponse.json({ error: "Enter a valid URL." }, { status: 400 });
  }

  try {
    const pageText = await fetchJobPageText(body.url);
    const { text, mock } = await completeWithFallback(
      parseJobPostingPrompt(pageText, body.url)
    );
    const parsed = parseJobPostingFromAI(text);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "Could not parse that job posting. Try pasting the description manually.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ ...parsed, mock });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
