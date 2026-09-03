import { requireAIUser } from "@/lib/ai/auth";
import { runRebuildMaster } from "@/lib/ai/rebuild-master-run";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { getApplicationsList } from "@/lib/applications/actions";
import {
  getLibraryData,
  getResumeVersion,
  updateResumeVersion,
} from "@/lib/resume/actions";
import {
  formatRebuildSourceLabel,
  selectRebuildMasterSources,
} from "@/lib/resume/rebuild-master-sources";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

export async function POST() {
  const auth = await requireAIUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const [{ versions, defaultVersionId }, { applications, archivedApplications }] =
      await Promise.all([getLibraryData(), getApplicationsList()]);

    if (!defaultVersionId) {
      return NextResponse.json(
        { error: "Set a primary resume before rebuilding your master." },
        { status: 400 }
      );
    }

    const primary = await getResumeVersion(defaultVersionId);
    if (!primary || primary.user_id !== auth.user.id || primary.archived_at) {
      return NextResponse.json(
        { error: "Primary resume not found or archived." },
        { status: 404 }
      );
    }

    const sources = selectRebuildMasterSources({
      defaultVersionId,
      activeVersions: versions,
      applications: [...applications, ...archivedApplications],
    });

    if (sources.length === 0) {
      return NextResponse.json(
        {
          error:
            "No recent tailored or application-linked resumes to merge yet. Tailor a few roles or log applications first.",
        },
        { status: 400 }
      );
    }

    const { data, mock } = await runRebuildMaster(auth, {
      primary: primary.data,
      secondaries: sources.map((source) => source.version.data),
    });

    await updateResumeVersion(defaultVersionId, { data });

    return NextResponse.json({
      versionId: defaultVersionId,
      sourceCount: sources.length,
      sourceLabels: sources.map(formatRebuildSourceLabel),
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
