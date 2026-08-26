import { requireAIUser } from "@/lib/ai/auth";
import { runCombineResumes } from "@/lib/ai/combine-run";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { getAuthedDb } from "@/lib/auth";
import { getResumeVersion, saveCombinedVersion } from "@/lib/resume/actions";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const bodySchema = z.object({
  sourceAId: z.string().uuid(),
  sourceBId: z.string().uuid(),
  emphasis: z.string().max(2000).optional(),
  name: z.string().max(120).optional(),
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

  if (body.sourceAId === body.sourceBId) {
    return NextResponse.json(
      { error: "Choose two different resumes to combine." },
      { status: 400 }
    );
  }

  try {
    const { userId } = await getAuthedDb();
    const [sourceA, sourceB] = await Promise.all([
      getResumeVersion(body.sourceAId),
      getResumeVersion(body.sourceBId),
    ]);

    if (
      !sourceA ||
      !sourceB ||
      sourceA.user_id !== userId ||
      sourceB.user_id !== userId
    ) {
      return NextResponse.json(
        { error: "Resume version not found." },
        { status: 404 }
      );
    }

    if (sourceA.archived_at || sourceB.archived_at) {
      return NextResponse.json(
        { error: "Restore archived resumes before combining them." },
        { status: 400 }
      );
    }

    const { data, mock } = await runCombineResumes(auth, {
      primary: sourceA.data,
      secondary: sourceB.data,
      emphasis: body.emphasis,
    });

    const version = await saveCombinedVersion({
      sourceAId: sourceA.id,
      sourceBId: sourceB.id,
      data,
      name: body.name?.trim() || undefined,
    });

    return NextResponse.json({
      version: {
        id: version.id,
        name: version.name,
      },
      mock,
    });
  } catch (err) {
    const aiError = aiRouteErrorResponse(err);
    if (aiError) return aiError;
    const message =
      err instanceof Error ? err.message : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
