import { requireAIUser } from "@/lib/ai/auth";
import { runCoverLetter } from "@/lib/ai/cover-letter-run";
import { runTailor } from "@/lib/ai/tailor-run";
import { logApplication } from "@/lib/applications/actions";
import { saveCoverLetter } from "@/lib/cover/actions";
import { fetchJobPageText, normalizeJobPostingUrl } from "@/lib/job/fetch-job-url";
import { parseJobPostingText } from "@/lib/job/parse-job-posting";
import { exportResumeAndCover } from "@/lib/mcp/exports";
import { appPath } from "@/lib/request/app-url";
import {
  getLibraryData,
  getResumeVersion,
  saveTailoredVersion,
} from "@/lib/resume/actions";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

function toolText(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function toolError(message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}

async function requireMcpAIUser() {
  const auth = await requireAIUser();
  if ("error" in auth) {
    throw new Error(auth.error);
  }
  return auth;
}

export const getDefaultResumeSchema = z.object({});

export async function getDefaultResume() {
  const library = await getLibraryData();
  if (!library.defaultVersionId) {
    return toolError("No default resume found. Import or create a master resume first.");
  }
  const version =
    library.versions.find((v) => v.id === library.defaultVersionId) ??
    (await getResumeVersion(library.defaultVersionId));
  if (!version) {
    return toolError("Default resume version is missing.");
  }
  return toolText({
    resume_id: version.id,
    name: version.name,
    template_style: version.template_style,
    data: version.data,
  });
}

export const tailorForJobSchema = z
  .object({
    job_url: z.string().url().max(2048).optional(),
    title: z.string().max(200).optional(),
    company: z.string().max(200).optional(),
    description: z.string().max(50_000).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.job_url) return;
    if (!val.description?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Provide job_url, or title/company/description.",
      });
    }
  });

export async function tailorForJob(input: z.infer<typeof tailorForJobSchema>) {
  const auth = await requireMcpAIUser();
  const library = await getLibraryData();
  if (!library.defaultVersionId) {
    return toolError("No default resume found. Import or create a master resume first.");
  }
  const base = await getResumeVersion(library.defaultVersionId);
  if (!base) return toolError("Default resume version is missing.");

  let jobRole = input.title?.trim() ?? "";
  let jobCompany = input.company?.trim() ?? "";
  let jobDesc = input.description?.trim() ?? "";
  let jobUrl = input.job_url?.trim() ?? "";

  if (jobUrl) {
    const normalizedUrl = normalizeJobPostingUrl(jobUrl);
    const pageText = await fetchJobPageText(normalizedUrl);
    const parsed = await parseJobPostingText(pageText, normalizedUrl, {
      userId: auth.user.id,
      userEmail: auth.user.email,
      planTier: auth.planTier,
    });
    jobRole = parsed.jobRole || jobRole;
    jobCompany = parsed.jobCompany || jobCompany;
    jobDesc = parsed.jobDesc || jobDesc;
    jobUrl = normalizedUrl;
  } else if (jobDesc.length >= 80 && (!jobRole || !jobCompany)) {
    const parsed = await parseJobPostingText(jobDesc, undefined, {
      userId: auth.user.id,
      userEmail: auth.user.email,
      planTier: auth.planTier,
    });
    jobRole = jobRole || parsed.jobRole || "";
    jobCompany = jobCompany || parsed.jobCompany || "";
    jobDesc = parsed.jobDesc || jobDesc;
  }

  if (!jobDesc.trim()) {
    return toolError("Job description is required (via job_url or description).");
  }

  const tailored = await runTailor(auth, {
    jobRole,
    jobCompany,
    jobDesc,
    depth: "deep",
    data: base.data,
  });

  const saved = await saveTailoredVersion({
    baseId: base.id,
    jobRole,
    jobCompany,
    jobDesc,
    jobUrl,
    depth: "deep",
    data: tailored.data,
  });

  return toolText({
    resume_id: saved.id,
    name: saved.name,
    match_notes: tailored.matchNotes,
    mock: tailored.mock,
    job: {
      title: jobRole,
      company: jobCompany,
      description: jobDesc,
      url: jobUrl,
    },
    data: saved.data,
  });
}

export const draftCoverLetterSchema = z.object({
  resume_version_id: z.string().uuid(),
  job_url: z.string().url().max(2048).optional(),
  title: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  description: z.string().max(50_000).optional(),
  hiring_manager: z.string().max(200).optional(),
});

export async function draftCoverLetter(
  input: z.infer<typeof draftCoverLetterSchema>
) {
  const auth = await requireMcpAIUser();
  const version = await getResumeVersion(input.resume_version_id);
  if (!version || version.user_id !== auth.user.id) {
    return toolError("Tailored resume not found for this account.");
  }

  const tf = version.tailored_for;
  let jobRole = input.title?.trim() || tf?.role || "";
  let jobCompany = input.company?.trim() || tf?.company || "";
  let jobDesc = input.description?.trim() || tf?.jobDesc || "";
  let jobUrl = input.job_url?.trim() || tf?.jobUrl || "";

  if (input.job_url) {
    const normalizedUrl = normalizeJobPostingUrl(input.job_url);
    const pageText = await fetchJobPageText(normalizedUrl);
    const parsed = await parseJobPostingText(pageText, normalizedUrl, {
      userId: auth.user.id,
      userEmail: auth.user.email,
      planTier: auth.planTier,
    });
    jobRole = parsed.jobRole || jobRole;
    jobCompany = parsed.jobCompany || jobCompany;
    jobDesc = parsed.jobDesc || jobDesc;
    jobUrl = normalizedUrl;
  }

  if (!jobDesc.trim()) {
    return toolError(
      "Job description missing. Pass description/job_url, or tailor_for_job first so the resume stores job context."
    );
  }

  const result = await runCoverLetter(auth, {
    jobRole,
    jobCompany,
    jobDesc,
    hiringManager: input.hiring_manager,
    summary: version.data.summary,
    contextNotes: tf?.contextNotes,
  });

  const saved = await saveCoverLetter({
    role: jobRole,
    company: jobCompany,
    body: result.letter,
    resumeVersionId: version.id,
  });
  if (!saved.ok) return toolError(saved.error);

  return toolText({
    cover_letter_id: saved.letter.id,
    title: saved.letter.title,
    body: saved.letter.body,
    resume_version_id: version.id,
    mock: result.mock,
    job: {
      title: jobRole,
      company: jobCompany,
      description: jobDesc,
      url: jobUrl,
    },
  });
}

export const exportAndTrackSchema = z.object({
  resume_version_id: z.string().uuid(),
  cover_letter_id: z.string().uuid().optional(),
  job_url: z.string().url().max(2048).optional(),
  title: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  description: z.string().max(50_000).optional(),
});

export async function exportAndTrack(
  input: z.infer<typeof exportAndTrackSchema>
) {
  const auth = await requireMcpAIUser();
  const version = await getResumeVersion(input.resume_version_id);
  if (!version || version.user_id !== auth.user.id) {
    return toolError("Tailored resume not found for this account.");
  }

  const supabase = createServiceClient();
  let coverBody = "";
  let coverLetterId = input.cover_letter_id ?? null;

  if (coverLetterId) {
    const { data: letter } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("id", coverLetterId)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (!letter) return toolError("Cover letter not found for this account.");
    coverBody = String(letter.body ?? "");
  } else {
    const { data: letter } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("resume_version_id", version.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (letter) {
      coverLetterId = letter.id as string;
      coverBody = String(letter.body ?? "");
    }
  }

  if (!coverBody.trim()) {
    return toolError(
      "No cover letter found. Call draft_cover_letter first, or pass cover_letter_id."
    );
  }

  const tf = version.tailored_for;
  const role = input.title?.trim() || tf?.role || "";
  const company = input.company?.trim() || tf?.company || "";
  const jobDesc = input.description?.trim() || tf?.jobDesc || "";
  const jobUrl = input.job_url?.trim() || tf?.jobUrl || "";

  const application = await logApplication({
    versionId: version.id,
    role,
    company,
    jobDesc,
    jobUrl,
    coverLetter: coverBody,
    status: "applied",
  });

  const { resumePdfUrl, coverPdfUrl } = await exportResumeAndCover({
    userId: auth.user.id,
    applicationId: application.id,
    version,
    coverBody,
  });

  return toolText({
    application_id: application.id,
    application_url: appPath(`/applications/${application.id}`),
    resume_version_id: version.id,
    cover_letter_id: coverLetterId,
    resume_pdf_url: resumePdfUrl,
    cover_pdf_url: coverPdfUrl,
    job: { title: role, company, description: jobDesc, url: jobUrl },
  });
}
