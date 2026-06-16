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

export function parseJobPostingPrompt(raw: string, sourceUrl?: string): string {
  const source = sourceUrl?.trim()
    ? `\nSOURCE URL: ${sourceUrl.trim()}\n`
    : "\n";

  return (
    "You are extracting structured job posting fields from web page text. Return ONLY valid minified JSON — no markdown, no commentary.\n\n" +
    source +
    "PAGE TEXT:\n" +
    raw +
    "\n\n" +
    'Return JSON with this exact shape: {"jobRole":"","jobCompany":"","jobDesc":""}\n' +
    "Rules:\n" +
    "- jobRole: the primary job title (e.g. VP of Growth, Senior Product Manager).\n" +
    "- jobCompany: the hiring company name only — no taglines.\n" +
    "- jobDesc: the full job description as clean plain text. Include responsibilities, requirements, and qualifications. Preserve bullet-like lines with newlines. Do NOT invent content.\n" +
    "- If a field is missing, use an empty string.\n" +
    "- jobDesc must be at least a few sentences when the posting content is present."
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

export function appInsightPrompt(
  positioning: string,
  userName: string,
  jobRole: string,
  jobCompany: string,
  jobDesc: string,
  summary: string,
  skills: string[],
  coverLetter: string
): string {
  return (
    buildPositioningContext(positioning, userName) +
    "\n\nTASK: Assess how well this application's materials fit the target job and what would most increase the odds of a response or interview. Be specific and candid. Return ONLY valid minified JSON, no markdown:\n" +
    '{"fitScore":<integer 0-100>,"strengths":["2-4 short bullets on what aligns well with the JD"],"gaps":["2-4 short bullets on what is missing or weak vs the JD"],"advice":"1-2 sentences naming the single highest-impact change"}\n\n' +
    "TARGET ROLE: " +
    (jobRole || "(n/a)") +
    " at " +
    (jobCompany || "(n/a)") +
    "\n" +
    "JOB DESCRIPTION:\n" +
    (jobDesc || "(none provided)") +
    "\n\n" +
    "RESUME SUMMARY: " +
    summary +
    "\n" +
    "RESUME SKILLS: " +
    skills.join(", ") +
    "\n" +
    "COVER LETTER:\n" +
    (coverLetter || "(none)")
  );
}

export function interviewPrepPrompt(
  positioning: string,
  userName: string,
  jobRole: string,
  jobCompany: string,
  jobDesc: string,
  summary: string
): string {
  return (
    buildPositioningContext(positioning, userName) +
    "\n\nTASK: Prepare " +
    userName +
    " for an interview for this role. Ground everything in their real background. Return ONLY valid minified JSON, no markdown:\n" +
    '{"questions":["6-8 likely interview questions for THIS role, mixing behavioral and role-specific"],"talkingPoints":["4-6 concise proof points/stories to lead with, tied to real wins"],"ask":["2-3 sharp questions to ask them"]}\n\n' +
    "TARGET ROLE: " +
    (jobRole || "(n/a)") +
    " at " +
    (jobCompany || "(n/a)") +
    "\n" +
    "JOB DESCRIPTION:\n" +
    (jobDesc || "(none)") +
    "\n\n" +
    "RESUME SUMMARY: " +
    summary
  );
}

export function resumeAssistPrompt(
  positioning: string,
  userName: string,
  action: string,
  data: ResumeData,
  experienceIndex?: number,
  question?: string,
  sectionId?: string,
  sectionIndex?: number
): string {
  const ctx =
    buildPositioningContext(positioning, userName) +
    "\n\nRESUME (JSON):\n" +
    JSON.stringify(data) +
    "\n\n";

  if (action === "improve-summary") {
    return (
      ctx +
      "TASK: Rewrite the summary/profile to be sharper and more outcome-focused. Use only facts from the resume. Return ONLY the new summary text — no markdown, no quotes."
    );
  }

  if (action === "improve-headline") {
    return (
      ctx +
      "CURRENT HEADLINE: " +
      (data.headline || "(none)") +
      "\n\n" +
      'TASK: Write 3 distinct professional headline options (each under 14 words), aligned to this candidate\'s experience. Vary angle (leadership, specialty, outcomes). Do not invent facts. Return ONLY valid minified JSON: {"headlines":["option 1","option 2","option 3"]}'
    );
  }

  if (action === "polish-bullets" && experienceIndex !== undefined) {
    const role = data.experience[experienceIndex];
    return (
      ctx +
      "TASK: Rewrite bullets for this role to be concise, quantified where possible, and outcome-led. Do NOT invent companies, titles, dates, or metrics.\n\n" +
      "ROLE: " +
      (role?.company || "") +
      " — " +
      (role?.title || "") +
      "\nCURRENT BULLETS:\n" +
      (role?.bullets || []).map((b) => "- " + b).join("\n") +
      '\n\nReturn ONLY valid minified JSON: {"blurb":"optional one-line role summary","bullets":["3-5 improved bullets"]}'
    );
  }

  if (action === "suggest-skills") {
    return (
      ctx +
      'TASK: Suggest 8-12 relevant skills based on this resume. Return ONLY valid minified JSON: {"skills":["skill1","skill2"]}'
    );
  }

  if (action === "ask" && question?.trim()) {
    return (
      ctx +
      "TASK: Answer this question about improving or positioning this resume. Be specific and actionable. Do not invent facts.\n\n" +
      "QUESTION: " +
      question.trim() +
      "\n\nReturn only your answer (2-5 sentences unless they ask for more)."
    );
  }

  if (action === "implement-suggestion" && question?.trim()) {
    const focus =
      sectionId === "experience" && sectionIndex !== undefined
        ? `experience role index ${sectionIndex}`
        : sectionId || "the active resume section";
    return (
      ctx +
      "TASK: Implement this improvement suggestion on the resume. Use ONLY facts from the resume — do not invent companies, titles, dates, or metrics.\n\n" +
      "FOCUS SECTION: " +
      focus +
      "\n" +
      "SUGGESTION TO IMPLEMENT:\n" +
      question.trim() +
      "\n\n" +
      'Return ONLY valid minified JSON with fields to update (omit fields that should not change): {"headline":"...","summary":"...","skills":["..."],"experience":{"index":0,"blurb":"...","bullets":["..."]}}'
    );
  }

  return (
    ctx +
    "TASK: Offer 3 specific, actionable suggestions to improve this resume. Return ONLY valid minified JSON: " +
    '{"suggestions":["suggestion 1","suggestion 2","suggestion 3"]}'
  );
}

export function hiringContactsPrompt(
  jobRole: string,
  jobCompany: string,
  jobDesc: string
): string {
  return (
    "You help job seekers decide WHO TO LOOK UP on LinkedIn or a company site — not find verified contact info.\n\n" +
    "ROLE: " +
    (jobRole.trim() || "Unknown role") +
    "\nCOMPANY: " +
    (jobCompany.trim() || "Unknown company") +
    "\nJOB DESCRIPTION:\n" +
    (jobDesc.trim() || "(not provided)") +
    "\n\n" +
    "Suggest 2-4 plausible roles or teams who might own hiring for this opening — e.g. hiring manager, department head, recruiter, talent acquisition.\n" +
    "Put the job title or role in the title field. Leave name empty unless the JD names a specific person.\n" +
    "Do NOT invent personal names, email addresses, or phone numbers.\n" +
    "confidence is high only when the JD names a person or team; medium for standard role titles; low for guesses.\n\n" +
    'Return ONLY valid minified JSON: {"contacts":[{"name":"...","title":"...","rationale":"...","confidence":"high"|"medium"|"low"}]}'
  );
}
