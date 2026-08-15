import { aiCallOptions } from "@/lib/ai/context";
import { extractJSON } from "@/lib/ai/extract-json";
import { completeWithFallback } from "@/lib/ai/mock";
import {
  tailorDeepRolesPrompt,
  tailorLightPrompt,
  tailorMetaPrompt,
} from "@/lib/ai/prompts";
import type { AICompletionOptions } from "@/lib/ai/mock";
import type { PlanTier } from "@/lib/ai/config";
import type { ResumeData } from "@/lib/types/resume";

export type TailorAuth = {
  user: { id: string; email?: string | null };
  userName: string;
  positioning: string;
  planTier: PlanTier;
};

export type TailorInput = {
  jobRole: string;
  jobCompany: string;
  jobDesc: string;
  depth: "light" | "deep";
  data: ResumeData;
  contextNotes?: string;
};

export type TailorResult = {
  data: ResumeData;
  matchNotes: string;
  mock: boolean;
};

type TailorMeta = {
  headline?: string;
  summary?: string;
  skills?: string[];
  matchNotes?: string;
};

type TailorRole = { i: number; blurb?: string; bullets?: string[] };

const DEEP_ROLE_BATCH = 4;

function norm(s: string) {
  return String(s || "").toLowerCase();
}

function applyTailorRoles(
  exp: ResumeData["experience"],
  roles: TailorRole[] | undefined
) {
  if (!roles?.length) return;
  roles.forEach((r) => {
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

async function tailorDeepRoleBatch(
  auth: TailorAuth,
  input: {
    jobRole: string;
    jobCompany: string;
    jobDesc: string;
    data: ResumeData;
    contextNotes: string;
    roles: {
      index: number;
      company: string;
      title: string;
      dates: string;
      bullets: string[];
    }[];
  },
  options: AICompletionOptions
): Promise<TailorRole[]> {
  const { userName, positioning } = auth;
  const rp = tailorDeepRolesPrompt(
    positioning,
    userName,
    input.jobRole,
    input.jobCompany,
    input.jobDesc,
    input.data,
    input.roles,
    input.contextNotes
  );
  const { text } = await completeWithFallback(rp, options);
  const part = extractJSON<{ roles?: TailorRole[] }>(text);
  return part?.roles ?? [];
}

/** Shared deep/light tailor used by /api/ai/tailor and the MCP apply loop. */
export async function runTailor(
  auth: TailorAuth,
  input: TailorInput
): Promise<TailorResult> {
  const { userName, positioning } = auth;
  const { jobRole, jobCompany, jobDesc, depth, data, contextNotes = "" } =
    input;

  const metaPrompt = tailorMetaPrompt(
    positioning,
    userName,
    jobRole,
    jobCompany,
    jobDesc,
    data,
    contextNotes
  );
  const { text: metaText, mock } = await completeWithFallback(
    metaPrompt,
    aiCallOptions(auth, "tailor_meta")
  );
  const meta = extractJSON<TailorMeta>(metaText) || {};

  if (
    !meta.summary &&
    !meta.headline &&
    !(Array.isArray(meta.skills) && meta.skills.length)
  ) {
    throw new Error("The tailoring response came back empty. Please try again.");
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
    const batchInputs: {
      roles: {
        index: number;
        company: string;
        title: string;
        dates: string;
        bullets: string[];
      }[];
    }[] = [];

    for (let start = 0; start < exp.length; start += DEEP_ROLE_BATCH) {
      const slice = exp.slice(start, start + DEEP_ROLE_BATCH);
      batchInputs.push({
        roles: slice.map((e, k) => ({
          index: start + k,
          company: e.company,
          title: e.title,
          dates: e.dates,
          bullets: e.bullets,
        })),
      });
    }

    const batchResults = await Promise.all(
      batchInputs.map((batch) =>
        tailorDeepRoleBatch(
          auth,
          {
            jobRole,
            jobCompany,
            jobDesc,
            data,
            contextNotes,
            roles: batch.roles,
          },
          aiCallOptions(auth, "tailor_role_batch")
        )
      )
    );

    batchResults.forEach((roles) => applyTailorRoles(exp, roles));
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
    const { text } = await completeWithFallback(
      lp,
      aiCallOptions(auth, "tailor_light")
    );
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

  return { data: tailored, matchNotes, mock };
}
