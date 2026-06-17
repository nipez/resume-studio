import { requireAIUser } from "@/lib/ai/auth";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { fetchJobPageText, normalizeJobPostingUrl } from "@/lib/job/fetch-job-url";
import { parseJobPostingText } from "@/lib/job/parse-job-posting";
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
    const normalizedUrl = normalizeJobPostingUrl(body.url);
    const pageText = await fetchJobPageText(normalizedUrl);
    const result = await parseJobPostingText(pageText, normalizedUrl, {
      userId: auth.user.id,
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
