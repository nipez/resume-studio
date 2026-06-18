export type PlanTier = "student" | "essentials" | "pro";

export type AIAction =
  | "cover_letter"
  | "answer_question"
  | "tailor_meta"
  | "tailor_role_batch"
  | "tailor_light"
  | "interview_debrief"
  | "interview_prep"
  | "app_insight"
  | "hiring_contacts"
  | "resume_assist"
  | "parse_resume"
  | "apply_resume_context"
  | "job_parse";

export type ModelTier = "fast" | "quality";

export const AI_PRO_MONTHLY_CAP = Number(process.env.AI_PRO_MONTHLY_CAP) || 100;
export const AI_STUDENT_COVER_LETTER_CAP = 2;
export const AI_COST_ALERT_USD = Number(process.env.AI_COST_ALERT_USD) || 8;

/** When false (default during beta), all users get Pro AI access; tier gates are skipped. */
export const AI_ENFORCE_PLAN_TIERS =
  process.env.AI_ENFORCE_PLAN_TIERS === "true";

const STUDENT_AI_ACTIONS: AIAction[] = [
  "cover_letter",
  "apply_resume_context",
  "parse_resume",
];

export function modelTierForAction(action: AIAction): ModelTier {
  switch (action) {
    case "tailor_meta":
    case "tailor_role_batch":
    case "tailor_light":
    case "interview_debrief":
    case "resume_assist":
    case "parse_resume":
      return "quality";
    default:
      return "fast";
  }
}

export function isActionAllowedForTier(
  action: AIAction,
  planTier: PlanTier
): { allowed: boolean; reason?: string } {
  if (planTier === "essentials") {
    return {
      allowed: false,
      reason:
        "AI features require Pro. Essentials includes the full workspace without AI costs.",
    };
  }

  if (planTier === "student" && !STUDENT_AI_ACTIONS.includes(action)) {
    return {
      allowed: false,
      reason:
        "This AI feature requires Pro. The Student plan includes guided building and 2 cover letters per month.",
    };
  }

  return { allowed: true };
}

export function resolveEffectivePlanTier(input: {
  planTier?: string | null;
  persona?: string | null;
  isStudent?: boolean | null;
}): PlanTier {
  if (!AI_ENFORCE_PLAN_TIERS) {
    return "pro";
  }

  const explicit = input.planTier?.trim().toLowerCase();
  if (explicit === "student" || explicit === "essentials" || explicit === "pro") {
    return explicit;
  }

  if (input.persona === "student") {
    return "student";
  }

  if (input.isStudent) {
    return "student";
  }

  return "pro";
}
