import { requireAIUser } from "@/lib/ai/auth";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { runTailor } from "@/lib/ai/tailor-run";
import type { ResumeData } from "@/lib/types/resume";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Allow long deep-tailor runs (multiple AI batches). */
export const maxDuration = 300;

const bodySchema = z.object({
  jobRole: z.string(),
  jobCompany: z.string(),
  jobDesc: z.string().min(1),
  depth: z.enum(["light", "deep"]),
  data: z.custom<ResumeData>(),
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
    const result = await runTailor(auth, body);
    return NextResponse.json(result);
  } catch (err) {
    const aiError = aiRouteErrorResponse(err);
    if (aiError) return aiError;
    const message =
      err instanceof Error ? err.message : "Something went wrong. Try again.";
    const status = message.includes("came back empty") ? 422 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
