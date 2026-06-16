import { requireAIUser } from "@/lib/ai/auth";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import { hiringContactsPrompt } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  jobRole: z.string(),
  jobCompany: z.string(),
  jobDesc: z.string(),
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

  if (!body.jobRole.trim() && !body.jobCompany.trim()) {
    return NextResponse.json(
      { error: "Add a role or company before suggesting roles to look up." },
      { status: 400 }
    );
  }

  try {
    const prompt = hiringContactsPrompt(body.jobRole, body.jobCompany, body.jobDesc);
    const { text, mock } = await completeWithFallback(prompt);
    const j = extractJSON<{
      contacts?: {
        name?: string;
        title?: string;
        rationale?: string;
        confidence?: string;
      }[];
    }>(text);

    const contacts = (j?.contacts ?? [])
      .map((c) => ({
        name: String(c.name ?? "").trim(),
        title: String(c.title ?? "").trim(),
        rationale: String(c.rationale ?? "").trim(),
        confidence: (["high", "medium", "low"].includes(String(c.confidence))
          ? c.confidence
          : "low") as "high" | "medium" | "low",
      }))
      .filter((c) => c.name || c.title);

    return NextResponse.json({ contacts, mock });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
