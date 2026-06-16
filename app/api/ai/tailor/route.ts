import { requireAIUser } from "@/lib/ai/auth";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import {
  tailorDeepRolesPrompt,
  tailorLightPrompt,
  tailorMetaPrompt,
} from "@/lib/ai/prompts";
import type { ResumeData } from "@/lib/types/resume";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  jobRole: z.string(),
  jobCompany: z.string(),
  jobDesc: z.string().min(1),
  depth: z.enum(["light", "deep"]),
  data: z.custom<ResumeData>(),
  contextNotes: z.string().optional(),
});

type TailorMeta = {
  headline?: string;
  summary?: string;
  skills?: string[];
  matchNotes?: string;
};

type TailorRole = { i: number; blurb?: string; bullets?: string[] };

function norm(s: string) {
  return String(s || "").toLowerCase();
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

  const { userName, positioning } = auth;
  const { jobRole, jobCompany, jobDesc, depth, data, contextNotes = "" } = body;

  try {
    const metaPrompt = tailorMetaPrompt(
      positioning,
      userName,
      jobRole,
      jobCompany,
      jobDesc,
      data,
      contextNotes
    );
    const { text: metaText, mock } = await completeWithFallback(metaPrompt);
    const meta = extractJSON<TailorMeta>(metaText) || {};

    if (
      !meta.summary &&
      !meta.headline &&
      !(Array.isArray(meta.skills) && meta.skills.length)
    ) {
      return NextResponse.json(
        { error: "The tailoring response came back empty. Please try again." },
        { status: 422 }
      );
    }

    const tailored: ResumeData = structuredClone(data);
    if (meta.headline) tailored.headline = meta.headline;
    if (meta.summary) tailored.summary = meta.summary;
    if (Array.isArray(meta.skills) && meta.skills.length) {
      tailored.skills = meta.skills;
    }
    const matchNotes =
      meta.matchNotes ||
      "Tailored to emphasize the most relevant experience for this role.";

    if (depth === "deep") {
      const exp = tailored.experience;
      const BATCH = 3;
      for (let start = 0; start < exp.length; start += BATCH) {
        const slice = exp.slice(start, start + BATCH);
        const roles = slice.map((e, k) => ({
          index: start + k,
          company: e.company,
          title: e.title,
          dates: e.dates,
          bullets: e.bullets,
        }));
        const rp = tailorDeepRolesPrompt(
          positioning,
          userName,
          jobRole,
          jobCompany,
          jobDesc,
          data,
          roles,
          contextNotes
        );
        const { text } = await completeWithFallback(rp);
        const part = extractJSON<{ roles?: TailorRole[] }>(text);
        if (part?.roles) {
          part.roles.forEach((r) => {
            const i = Number(r?.i);
            if (!isNaN(i) && exp[i]) {
              if (typeof r.blurb === "string" && r.blurb.trim()) {
                exp[i].blurb = r.blurb.trim();
              }
              if (Array.isArray(r.bullets) && r.bullets.length) {
                exp[i].bullets = r.bullets;
              }
            }
          });
        }
      }
    } else {
      const lp = tailorLightPrompt(
        positioning,
        userName,
        jobRole,
        jobCompany,
        jobDesc,
        data,
        contextNotes
      );
      const { text } = await completeWithFallback(lp);
      const lj = extractJSON<{ highlights?: Record<string, string[]> }>(text);
      if (lj?.highlights && typeof lj.highlights === "object") {
        tailored.experience = tailored.experience.map((e) => {
          const key = Object.keys(lj.highlights!).find(
            (k) =>
              norm(e.company).includes(norm(k)) || norm(k).includes(norm(e.company))
          );
          if (
            key &&
            Array.isArray(lj.highlights![key]) &&
            lj.highlights![key].length
          ) {
            return { ...e, bullets: lj.highlights![key] };
          }
          return e;
        });
      }
    }

    return NextResponse.json({
      data: tailored,
      matchNotes,
      mock,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
