import { requireAIUser } from "@/lib/ai/auth";
import { aiCallOptions } from "@/lib/ai/context";
import { aiRouteErrorResponse } from "@/lib/ai/route-error";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import { jobDiscoveryPrompt } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";
import { z } from "zod";

const criteriaSchema = z.object({
  roleTitles: z.string(),
  location: z.string(),
  industry: z.string(),
  companySize: z.string(),
  keywords: z.string(),
  territoryNotes: z.string(),
  mustHave: z.string(),
  exclude: z.string(),
});

const bodySchema = z.object({
  criteria: criteriaSchema,
});

function normalizePriority(value: unknown): "high" | "medium" | "low" {
  const raw = String(value ?? "").toLowerCase();
  if (raw === "high" || raw === "medium" || raw === "low") return raw;
  return "medium";
}

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

  const { criteria } = body;
  if (
    !criteria.roleTitles.trim() &&
    !criteria.location.trim() &&
    !criteria.industry.trim()
  ) {
    return NextResponse.json(
      { error: "Add at least a role, location, or industry to generate targets." },
      { status: 400 }
    );
  }

  try {
    const prompt = jobDiscoveryPrompt(criteria);
    const { text, mock } = await completeWithFallback(
      prompt,
      aiCallOptions(auth, "job_discovery")
    );
    const j = extractJSON<{
      summary?: string;
      linkedinQueries?: string[];
      searchTips?: string[];
      targets?: {
        company?: string;
        role?: string;
        rationale?: string;
        researchSteps?: string[];
        linkedinSearch?: string;
        careersHint?: string;
        priority?: string;
      }[];
    }>(text);

    const targets = (j?.targets ?? [])
      .map((target) => ({
        company: String(target.company ?? "").trim(),
        role: String(target.role ?? "").trim(),
        rationale: String(target.rationale ?? "").trim(),
        researchSteps: (target.researchSteps ?? [])
          .map((step) => String(step).trim())
          .filter(Boolean),
        linkedinSearch: String(target.linkedinSearch ?? "").trim(),
        careersHint: String(target.careersHint ?? "").trim(),
        priority: normalizePriority(target.priority),
      }))
      .filter((target) => target.company || target.role);

    return NextResponse.json({
      summary: String(j?.summary ?? "").trim(),
      linkedinQueries: (j?.linkedinQueries ?? [])
        .map((query) => String(query).trim())
        .filter(Boolean),
      searchTips: (j?.searchTips ?? [])
        .map((tip) => String(tip).trim())
        .filter(Boolean),
      targets,
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
