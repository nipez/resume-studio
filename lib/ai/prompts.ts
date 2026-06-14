import type { ResumeData } from "@/lib/types/resume";

export function buildPositioningContext(
  positioning: string,
  userName?: string
): string {
  const name = userName?.trim() || "the candidate";
  const notes = positioning.trim();
  if (notes) {
    return [
      `${name.toUpperCase()} — POSITIONING CONTEXT (use to inform all generated content; never invent facts beyond this):`,
      notes,
    ].join("\n");
  }
  return [
    `${name.toUpperCase()} — POSITIONING CONTEXT:`,
    "- Use only facts present in the resume and job description.",
    "- Position the candidate as a capable professional aligned to the target role.",
    "- Do NOT invent companies, titles, dates, or metrics.",
    "- Reframe and emphasize existing experience; speak in outcomes and specifics.",
  ].join("\n");
}

export function parseResumePrompt(raw: string): string {
  return (
    "You are parsing a resume into structured JSON for a resume builder. Return ONLY valid minified JSON — no markdown, no commentary.\n\n" +
    "RESUME TEXT:\n" +
    raw +
    "\n\n" +
    'Return JSON with this exact shape: {"name":"","headline":"","phone":"","email":"","location":"","linkedin":"","summary":"","skills":[],"experience":[{"company":"","title":"","dates":"","blurb":"","bullets":[]}],"education":[{"school":"","degree":"","year":""}]}\n' +
    "Rules: keep ALL roles in reverse-chronological order (most recent first); keep bullets as concise outcome statements exactly as written; do NOT invent facts — leave a field empty if it is not present. If there is no written summary or headline, craft a short professional one from the content. Skills should be an array of short skill phrases."
  );
}

export function tailorMetaPrompt(
  positioning: string,
  userName: string,
  jobRole: string,
  jobCompany: string,
  jobDesc: string,
  data: ResumeData
): string {
  const ctx =
    buildPositioningContext(positioning, userName) +
    "\n\nTARGET ROLE: " +
    (jobRole || "(not specified)") +
    " at " +
    (jobCompany || "(not specified)") +
    "\n\n" +
    "JOB DESCRIPTION:\n" +
    jobDesc +
    "\n\n" +
    "CURRENT SUMMARY: " +
    data.summary +
    "\n" +
    "CURRENT SKILLS: " +
    data.skills.join(", ") +
    "\n\n";

  return (
    ctx +
    `TASK: Tailor the META of ${userName}'s resume for this role. Do not invent facts. Return ONLY valid minified JSON, no markdown:\n` +
    '{"headline":"short role-aligned headline","summary":"3-4 sentence first-person summary emphasizing fit for THIS role","skills":["~12 most relevant skills, reordered/rephrased for this role"],"matchNotes":"2-3 sentences on what you emphasized and why they fit"}'
  );
}

export function tailorDeepRolesPrompt(
  positioning: string,
  userName: string,
  jobRole: string,
  jobCompany: string,
  jobDesc: string,
  data: ResumeData,
  roles: { index: number; company: string; title: string; dates: string; bullets: string[] }[]
): string {
  const block = roles
    .map((e) => {
      return (
        "[" +
        e.index +
        "] " +
        e.company +
        " — " +
        e.title +
        " — " +
        e.dates +
        "\n   current bullets:\n" +
        (e.bullets || []).map((b) => "    - " + b).join("\n")
      );
    })
    .join("\n");

  const ctx =
    buildPositioningContext(positioning, userName) +
    "\n\nTARGET ROLE: " +
    (jobRole || "(not specified)") +
    " at " +
    (jobCompany || "(not specified)") +
    "\n\n" +
    "JOB DESCRIPTION:\n" +
    jobDesc +
    "\n\n" +
    "CURRENT SUMMARY: " +
    data.summary +
    "\n" +
    "CURRENT SKILLS: " +
    data.skills.join(", ") +
    "\n\n";

  return (
    ctx +
    "TASK: Rewrite ONLY these " +
    roles.length +
    " role(s) so each speaks to the target job. Keep outcomes truthful — reframe and re-emphasize existing facts to mirror the JD, but do NOT fabricate metrics, companies, titles, or dates. Keep roles in place; do not reorder.\n\n" +
    "ROLES (with original index):\n" +
    block +
    "\n\n" +
    'Return ONLY valid minified JSON, no markdown: {"roles":[{"i":<original index>,"blurb":"rewritten one-line summary tuned to the JD","bullets":["3-5 rewritten bullets tuned to the JD"]}]}\n' +
    "Include exactly one object per role above, using the given indices."
  );
}

export function tailorLightPrompt(
  positioning: string,
  userName: string,
  jobRole: string,
  jobCompany: string,
  jobDesc: string,
  data: ResumeData
): string {
  const ctx =
    buildPositioningContext(positioning, userName) +
    "\n\nTARGET ROLE: " +
    (jobRole || "(not specified)") +
    " at " +
    (jobCompany || "(not specified)") +
    "\n\n" +
    "JOB DESCRIPTION:\n" +
    jobDesc +
    "\n\n" +
    "CURRENT SUMMARY: " +
    data.summary +
    "\n" +
    "CURRENT SKILLS: " +
    data.skills.join(", ") +
    "\n\n";

  return (
    ctx +
    "WORK HISTORY (company — title — dates):\n" +
    data.experience.map((e) => "- " + e.company + " — " + e.title + " — " + e.dates).join("\n") +
    "\n\n" +
    "TASK (LIGHT): pick the up-to-3 roles MOST relevant to this JD and rewrite their bullets. The resume stays reverse-chronological — do NOT reorder roles, only rewrite bullets in place. Do not fabricate facts.\n" +
    'Return ONLY valid minified JSON, no markdown: {"highlights":{"<exact company name from the list above>":["up to 4 rewritten, quantified bullets tuned to the JD"]}}'
  );
}

export function coverLetterPrompt(
  positioning: string,
  userName: string,
  jobRole: string,
  jobCompany: string,
  jobDesc: string,
  hiringManager: string,
  summary: string
): string {
  return (
    buildPositioningContext(positioning, userName) +
    "\n\nWrite a concise, confident cover letter (250-320 words) for " +
    userName +
    " applying to " +
    (jobRole || "this role") +
    " at " +
    (jobCompany || "the company") +
    ". " +
    "First person. Specific and tied to business outcomes. Avoid clichés, buzzword stacking, and generic filler. Reference 1-2 concrete wins only if genuinely relevant to the JD. " +
    (hiringManager
      ? "Address it to " + hiringManager + "."
      : 'Use a simple greeting like "Dear Hiring Team,".') +
    "\n\nJOB DESCRIPTION:\n" +
    jobDesc +
    "\n\nSUMMARY: " +
    summary +
    "\n\nReturn ONLY the letter body text (greeting through sign-off \"" +
    userName +
    "\"). No subject line, no markdown, no notes."
  );
}

export function answerQuestionPrompt(
  positioning: string,
  userName: string,
  jobRole: string,
  jobCompany: string,
  jobDesc: string,
  question: string,
  summary: string
): string {
  return (
    buildPositioningContext(positioning, userName) +
    "\n\nAnswer the following job-application question as " +
    userName +
    " — first person, confident and specific, 120-180 words. Tie it to concrete outcomes where relevant. No generic filler, no markdown.\n\n" +
    "TARGET ROLE: " +
    (jobRole || "(n/a)") +
    " at " +
    (jobCompany || "(n/a)") +
    "\n" +
    "JOB DESCRIPTION (context):\n" +
    (jobDesc || "(none provided)") +
    "\n\n" +
    "RESUME SUMMARY: " +
    summary +
    "\n\n" +
    "QUESTION: " +
    question +
    "\n\nReturn only the answer text."
  );
}
