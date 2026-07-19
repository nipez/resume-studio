import { requireAIUser } from "@/lib/ai/auth";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { parseJobPostingText } from "@/lib/job/parse-job-posting";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  text: z.string().min(80).max(50_000),
  sourceUrl: z.string().url().max(2048).optional(),
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
    return NextResponse.json(
      {
        error:
          "Paste the full job description (at least a few sentences) to parse.",
      },
      { status: 400 }
    );
  }

  try {
    const result = await parseJobPostingText(body.text, body.sourceUrl, {
      userId: auth.user.id,
      userEmail: auth.user.email,
      planTier: auth.planTier,
    });
    return NextResponse.json(result);
  } catch (err) {
    const aiError = aiRouteErrorResponse(err);
    if (aiError) return aiError;
    const message =
      err instanceof Error ? err.message : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
