import type { ResumeData } from "@/lib/types/resume";
import {
  answerLengthInstruction,
  extractAnswerLengthLimit,
} from "@/lib/ai/answer-length";
import {
  buildSystemGuidelinesBlock,
  type SystemGuidelines,
} from "@/lib/ai/system-guidelines";

type SystemGuidelinesInput = Pick<
  SystemGuidelines,
  "guidelines" | "bannedPhrases"
> | null;

export function buildPositioningContext(
  positioning: string,
  userName?: string,
  systemGuidelines?: SystemGuidelinesInput
): string {
  const guidelinesBlock = systemGuidelines
    ? buildSystemGuidelinesBlock(systemGuidelines)
    : "";
  const name = userName?.trim() || "the candidate";
  const notes = positioning.trim();
  const positioningBlock = notes
    ? [
        `${name.toUpperCase()} — POSITIONING CONTEXT (use to inform all generated content; never invent facts beyond this):`,
        notes,
      ].join("\n")
    : [
        `${name.toUpperCase()} — POSITIONING CONTEXT:`,
        "- Use only facts present in the resume and job description.",
        "- Position the candidate as a capable professional aligned to the target role.",
        "- Do NOT invent companies, titles, dates, or metrics.",
        "- Reframe and emphasize existing experience; speak in outcomes and specifics.",
      ].join("\n");

  return guidelinesBlock + positioningBlock;
}

export function buildExtraContextBlock(contextNotes: string): string {
  const notes = contextNotes.trim();
  if (!notes) return "";
  return (
    "USER CONTEXT NOTES (honor when tailoring; do not invent facts beyond the resume, job description, and these notes):\n" +
    notes +
    "\n\n"
  );
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
  data: ResumeData,
  contextNotes = "",
  systemGuidelines?: SystemGuidelinesInput
): string {
  const ctx =
    buildPositioningContext(positioning, userName, systemGuidelines) +
    "\n\n" +
    buildExtraContextBlock(contextNotes) +
    "TARGET ROLE: " +
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
  roles: { index: number; company: string; title: string; dates: string; bullets: string[] }[],
  contextNotes = "",
  systemGuidelines?: SystemGuidelinesInput
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
    buildPositioningContext(positioning, userName, systemGuidelines) +
    "\n\n" +
    buildExtraContextBlock(contextNotes) +
    "TARGET ROLE: " +
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
  data: ResumeData,
  contextNotes = "",
  systemGuidelines?: SystemGuidelinesInput
): string {
  const ctx =
    buildPositioningContext(positioning, userName, systemGuidelines) +
    "\n\n" +
    buildExtraContextBlock(contextNotes) +
    "TARGET ROLE: " +
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
  summary: string,
  contextNotes = "",
  systemGuidelines?: SystemGuidelinesInput
): string {
  return (
    buildPositioningContext(positioning, userName, systemGuidelines) +
    buildExtraContextBlock(contextNotes) +
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
  summary: string,
  systemGuidelines?: SystemGuidelinesInput
): string {
  const lengthLimit = extractAnswerLengthLimit(question);
  const lengthRule = answerLengthInstruction(lengthLimit);
  const hardLimitNote = lengthLimit
    ? " Obey any word or character limit stated in the QUESTION as a hard ceiling — never exceed it.\n\n"
    : "\n\n";

  return (
    buildPositioningContext(positioning, userName, systemGuidelines) +
    "\n\nAnswer the following job-application question as " +
    userName +
    " — first person, confident and specific, " +
    lengthRule +
    ". Tie it to concrete outcomes where relevant. No generic filler, no markdown." +
    hardLimitNote +
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
  coverLetter: string,
  systemGuidelines?: SystemGuidelinesInput
): string {
  return (
    buildPositioningContext(positioning, userName, systemGuidelines) +
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
  summary: string,
  systemGuidelines?: SystemGuidelinesInput
): string {
  return (
    buildPositioningContext(positioning, userName, systemGuidelines) +
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

export function interviewDebriefPrompt(
  positioning: string,
  userName: string,
  jobRole: string,
  jobCompany: string,
  jobDesc: string,
  summary: string,
  coverLetter: string,
  prepQuestions: string[],
  transcript: string,
  focusNote?: string,
  systemGuidelines?: SystemGuidelinesInput
): string {
  const prepBlock =
    prepQuestions.length > 0
      ? "PREP QUESTIONS WE GENERATED:\n" + prepQuestions.map((q) => `- ${q}`).join("\n") + "\n\n"
      : "";

  const focusBlock = focusNote?.trim()
    ? "CANDIDATE FOCUS FOR THIS DEBRIEF:\n" + focusNote.trim() + "\n\n"
    : "";

  return (
    buildPositioningContext(positioning, userName, systemGuidelines) +
    "\n\nTASK: Analyze this interview transcript for " +
    userName +
    ". Ground everything in what was actually said and how it maps to the target role and materials they sent. Be candid and practical. Return ONLY valid minified JSON, no markdown:\n" +
    '{"summary":["3-5 bullet recap of what happened"],"landed":["2-4 bullets on answers or themes that landed well"],"gaps":["2-4 bullets on weak spots, missed chances, or concerns to address"],"openQuestions":["1-3 open items they should clarify or follow up on"],"followUpEmail":"A concise, professional thank-you / follow-up email draft (plain text, 2-4 short paragraphs max)","nextRoundPrep":["2-4 bullets to prep if there is a next round, or empty array if unclear"]}\n\n' +
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
    "COVER LETTER SENT:\n" +
    (coverLetter || "(none)") +
    "\n\n" +
    prepBlock +
    focusBlock +
    "INTERVIEW TRANSCRIPT:\n" +
    (transcript || "(empty)")
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
  sectionIndex?: number,
  targetPages = 2,
  systemGuidelines?: SystemGuidelinesInput
): string {
  const ctx =
    buildPositioningContext(positioning, userName, systemGuidelines) +
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

  if (action === "shorten-to-pages") {
    const pages = Math.min(3, Math.max(1, targetPages));
    return (
      ctx +
      `TASK: Compress this resume to fit approximately ${pages} US Letter printed page(s). The goal is fewer words and bullets while keeping the same career story.\n\n` +
      "Rules:\n" +
      "- Keep ALL companies, titles, and dates. Do not invent employers, titles, dates, or metrics.\n" +
      "- Shorten the summary to 2–3 tight sentences.\n" +
      "- Use 3–4 bullets for the most recent 2 roles, 2–3 for older roles; remove redundant or weak bullets.\n" +
      "- Trim skills to the 10–12 most relevant.\n" +
      "- Shorten activity/honors sections if present; omit only when necessary for length.\n" +
      "- Preserve contact fields (name, phone, email, location, linkedin) exactly.\n\n" +
      'Return ONLY valid minified JSON with the full resume: {"name":"","headline":"","phone":"","email":"","location":"","linkedin":"","summary":"","skills":[],"experience":[{"company":"","title":"","dates":"","blurb":"","bullets":[]}],"activities":[],"education":[{"school":"","degree":"","year":""}],"awards":[]}'
    );
  }

  return (
    ctx +
    "TASK: Offer 3 specific, actionable suggestions to improve this resume. Return ONLY valid minified JSON: " +
    '{"suggestions":["suggestion 1","suggestion 2","suggestion 3"]}'
  );
}

export function applyResumeContextPrompt(
  positioning: string,
  userName: string,
  data: ResumeData,
  contextNotes: string,
  systemGuidelines?: SystemGuidelinesInput
): string {
  return (
    buildPositioningContext(positioning, userName, systemGuidelines) +
    "\n\n" +
    buildExtraContextBlock(contextNotes) +
    "CURRENT RESUME (JSON):\n" +
    JSON.stringify(data) +
    "\n\n" +
    "TASK: Refine this resume so the user's context notes are reflected — emphasize what they asked for in headline, summary, skills, and relevant experience bullets. Do NOT invent companies, titles, dates, or metrics. Keep structure and all roles; preserve contact info exactly.\n" +
    'Return ONLY valid minified JSON with the same shape as the input resume: {"name":"","headline":"","phone":"","email":"","location":"","linkedin":"","summary":"","skills":[],"experience":[{"company":"","title":"","dates":"","blurb":"","bullets":[]}],"education":[{"school":"","degree":"","year":""}],"awards":[]}'
  );
}

export function applyResumeUpdateRequestPrompt(
  positioning: string,
  userName: string,
  data: ResumeData,
  updateRequest: string,
  systemGuidelines?: SystemGuidelinesInput
): string {
  return (
    buildPositioningContext(positioning, userName, systemGuidelines) +
    "\n\n" +
    "USER UPDATE REQUEST (apply this change):\n" +
    updateRequest.trim() +
    "\n\n" +
    "CURRENT RESUME (JSON):\n" +
    JSON.stringify(data) +
    "\n\n" +
    "TASK: Apply the user's update request to this resume and return the full updated resume JSON.\n" +
    "Rules:\n" +
    "- Honor explicit edit requests (e.g. rename a title, rephrase a bullet, tweak the summary, reorder emphasis).\n" +
    "- If they ask to change an existing title, company label, dates, or wording that already appears on the resume, do that change.\n" +
    "- Do NOT invent new employers, roles, dates, or metrics that are not already on the resume or explicitly stated in the request.\n" +
    "- Keep contact fields (name, phone, email, location, linkedin) exactly unless the request asks to change them.\n" +
    "- Preserve all roles and overall structure unless the request asks to remove or merge something.\n" +
    "- Change only what the request requires; leave unrelated content intact.\n" +
    'Return ONLY valid minified JSON with the same shape as the input resume: {"name":"","headline":"","phone":"","email":"","location":"","linkedin":"","summary":"","skills":[],"experience":[{"company":"","title":"","dates":"","blurb":"","bullets":[]}],"education":[{"school":"","degree":"","year":""}],"awards":[]}'
  );
}

export function combineResumesPrompt(
  positioning: string,
  userName: string,
  primary: ResumeData,
  secondary: ResumeData,
  emphasis: string,
  systemGuidelines?: SystemGuidelinesInput
): string {
  const notes = emphasis.trim();
  return (
    buildPositioningContext(positioning, userName, systemGuidelines) +
    "\n\n" +
    "COMBINE TWO RESUMES INTO ONE HYBRID.\n" +
    "The candidate has two generated cuts (for example marketing/growth vs product/AI). " +
    "Produce one resume that a hiring manager can read as a single coherent document.\n\n" +
    "PRIMARY RESUME (keep contact, name, and overall voice from this version):\n" +
    JSON.stringify(primary) +
    "\n\n" +
    "SECONDARY RESUME (pull unique roles, skills, and bullets from this version):\n" +
    JSON.stringify(secondary) +
    "\n\n" +
    (notes
      ? "EMPHASIS NOTES (honor when blending; do not invent facts beyond either resume and these notes):\n" +
        notes +
        "\n\n"
      : "") +
    "TASK: Combine these two resumes into one hybrid.\n" +
    "Rules:\n" +
    "- Use ONLY facts that appear in the primary resume, the secondary resume, or the emphasis notes. Do NOT invent companies, titles, dates, metrics, awards, or skills.\n" +
    "- Keep contact fields (name, phone, email, location, linkedin) exactly as in the primary resume; fill an empty primary field from the secondary if present.\n" +
    "- Blend headline and summary so both directions of experience are visible, unless emphasis notes ask to lean one way.\n" +
    "- Union skills and awards; drop exact duplicates (case-insensitive).\n" +
    "- Merge roles that are the same company + title: keep one role, union unique bullets, prefer the more complete dates/blurb.\n" +
    "- Keep roles that exist on only one resume. Preserve reverse-chronological order as much as possible.\n" +
    "- Same rules for activities. Union education by school + degree.\n" +
    "- Do not drop a real role just to shorten the page unless emphasis notes explicitly ask to de-emphasize it — then keep the role but you may trim weaker bullets.\n" +
    'Return ONLY valid minified JSON with the full resume: {"name":"","headline":"","phone":"","email":"","location":"","linkedin":"","summary":"","skills":[],"experience":[{"company":"","title":"","dates":"","blurb":"","bullets":[]}],"activities":[],"education":[{"school":"","degree":"","year":""}],"awards":[]}'
  );
}

export function rebuildMasterPrompt(
  positioning: string,
  userName: string,
  primary: ResumeData,
  secondaries: ResumeData[],
  systemGuidelines?: SystemGuidelinesInput
): string {
  const blocks = secondaries
    .map(
      (resume, index) =>
        `RECENT CUT ${index + 1} (tailored or sent for an application — pull the strongest unique bullets, skills, and phrasing):\n` +
        JSON.stringify(resume)
    )
    .join("\n\n");

  return (
    buildPositioningContext(positioning, userName, systemGuidelines) +
    "\n\n" +
    "REBUILD MASTER RESUME FROM RECENT TAILORED CUTS.\n" +
    "The candidate's primary resume is stale. Merge the best factual content from their recent job-specific versions back into one updated master resume they can use as their new default.\n\n" +
    "CURRENT PRIMARY / MASTER RESUME (keep contact info, name, and overall voice — refresh headline, summary, skills, and bullets):\n" +
    JSON.stringify(primary) +
    "\n\n" +
    blocks +
    "\n\n" +
    "TASK: Produce one refreshed master resume.\n" +
    "Rules:\n" +
    "- Use ONLY facts present in the primary resume or the recent cuts above. Do NOT invent companies, titles, dates, metrics, awards, or skills.\n" +
    "- Keep contact fields (name, phone, email, location, linkedin) exactly as in the primary resume.\n" +
    "- Rewrite headline and summary to reflect the candidate's current positioning using the strongest themes across recent cuts.\n" +
    "- Union skills; drop exact duplicates (case-insensitive).\n" +
    "- For each company+title role: merge bullets — prefer sharper, outcome-led bullets from recent cuts; dedupe near-duplicates.\n" +
    "- Keep all real roles; preserve reverse-chronological order.\n" +
    "- Do not drop experience just to shorten — trim weak duplicate bullets instead.\n" +
    "- The result should read as one coherent master resume, not a keyword dump.\n" +
    'Return ONLY valid minified JSON with the full resume: {"name":"","headline":"","phone":"","email":"","location":"","linkedin":"","summary":"","skills":[],"experience":[{"company":"","title":"","dates":"","blurb":"","bullets":[]}],"activities":[],"education":[{"school":"","degree":"","year":""}],"awards":[]}'
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

export function jobDiscoveryPrompt(criteria: {
  roleTitles: string;
  location: string;
  industry: string;
  companySize: string;
  keywords: string;
  territoryNotes: string;
  mustHave: string;
  exclude: string;
}): string {
  return (
    "You help job seekers plan a TARGETED JOB SEARCH — not scrape LinkedIn or Indeed.\n" +
    "The user will research companies and roles themselves using your plan.\n\n" +
    "SEARCH CRITERIA:\n" +
    "Role titles: " +
    (criteria.roleTitles.trim() || "(not specified)") +
    "\nLocation / territory: " +
    (criteria.location.trim() || "(not specified)") +
    "\nIndustry / vertical: " +
    (criteria.industry.trim() || "(not specified)") +
    "\nCompany size: " +
    (criteria.companySize.trim() || "(not specified)") +
    "\nKeywords / solutions: " +
    (criteria.keywords.trim() || "(not specified)") +
    "\nTerritory / competitive notes: " +
    (criteria.territoryNotes.trim() || "(not specified)") +
    "\nMust have: " +
    (criteria.mustHave.trim() || "(not specified)") +
    "\nExclude: " +
    (criteria.exclude.trim() || "(not specified)") +
    "\n\n" +
    "Produce a practical research plan:\n" +
    "1. summary — 2-3 sentences on the search strategy\n" +
    "2. linkedinQueries — 3-5 copy-paste Boolean search strings for LinkedIn (people + jobs). Do NOT claim you looked anyone up.\n" +
    "3. searchTips — 3-5 actionable tips (career pages, HRMS patterns, industry lists, etc.)\n" +
    "4. targets — 6-10 plausible company+role combinations that FIT the criteria. Use real company names when confident; otherwise describe archetypes clearly (e.g. 'Mid-market HRIS vendor — example: Rippling-class').\n" +
    "   For each target include: company, role, rationale, researchSteps (2-4 bullets), linkedinSearch (one query string), careersHint (how to find their careers page), priority (high|medium|low).\n\n" +
    "Do NOT invent job URLs, employee names, or claim live data. This is strategic planning only.\n\n" +
    'Return ONLY valid minified JSON: {"summary":"...","linkedinQueries":["..."],"searchTips":["..."],"targets":[{"company":"...","role":"...","rationale":"...","researchSteps":["..."],"linkedinSearch":"...","careersHint":"...","priority":"high"|"medium"|"low"}]}'
  );
}
