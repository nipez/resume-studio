export type BillingPlanId = "student" | "standard" | "pro";

/** Legacy DB / env value — treated as {@link BillingPlanId.standard}. */
export const LEGACY_ESSENTIALS_PLAN_ID = "essentials";

/** Matches {@link AI_PRO_MONTHLY_CAP} default in lib/ai/config.ts */
const PRO_AI_ACTIONS_CAP = 100;
/** Matches {@link AI_STUDENT_COVER_LETTER_CAP} in lib/ai/config.ts */
const STUDENT_COVER_LETTER_CAP = 2;

export type BillingPlan = {
  id: BillingPlanId;
  displayName: string;
  price: string;
  period: string;
  badge: string;
  description: string;
  marketingFeatures: string[];
  highlighted: boolean;
  cta: string;
  /** Workspace modules included (non-AI). */
  workspaceIncludes: string[];
  /** Human-readable AI entitlement summary for admin. */
  aiSummary: string;
  entitlements: {
    aiEnabled: boolean;
    /** Pro fair-use cap; student cover-letter cap is separate. */
    aiActionsPerMonth: number | null;
    coverLettersPerMonth: number | null;
    allowedAiActions: string[] | "all" | "student_subset" | "none";
  };
};

const STUDENT_AI_ACTIONS = [
  "cover_letter",
  "apply_resume_context",
  "parse_resume",
] as const;

const PRO_AI_ACTIONS = [
  "cover_letter",
  "answer_question",
  "tailor_meta",
  "tailor_role_batch",
  "tailor_light",
  "interview_debrief",
  "interview_prep",
  "app_insight",
  "hiring_contacts",
  "resume_assist",
  "parse_resume",
  "apply_resume_context",
  "job_parse",
];

const WORKSPACE_CORE = [
  "Resume library & version editor",
  "3 print-ready templates + PDF export",
  "Application tracking & timeline",
  "Immutable send snapshots",
  "Saved jobs queue",
  "Insights dashboard",
] as const;

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "student",
    displayName: "Student",
    price: "$2.99",
    period: "/month",
    badge: "High school & college",
    description:
      "First resume? Clubs, sports, volunteering, honors — guided step-by-step.",
    marketingFeatures: [
      "Guided resume builder",
      "Activities & clubs sections",
      "3 print-ready templates",
      "PDF export",
      "2 human-sounding cover letters / month",
    ],
    highlighted: false,
    cta: "Start as a student",
    workspaceIncludes: [
      "Guided resume builder",
      "Activities & clubs sections",
      ...WORKSPACE_CORE.filter((f) => f !== "Insights dashboard"),
      "Student onboarding path",
    ],
    aiSummary: `Light AI only — ${STUDENT_COVER_LETTER_CAP} cover letters/mo plus resume parse & context assist. No tailor, Q&A, or interview prep.`,
    entitlements: {
      aiEnabled: true,
      aiActionsPerMonth: null,
      coverLettersPerMonth: STUDENT_COVER_LETTER_CAP,
      allowedAiActions: "student_subset",
    },
  },
  {
    id: "pro",
    displayName: "Pro",
    price: "$19",
    period: "/month",
    badge: "Human-sounding AI",
    description:
      "The full AI-powered apply loop — job-tailored resumes, cover letters that sound like you, and interview prep. Or $39 for a 3-month Job Search Pass.",
    marketingFeatures: [
      "Tailor your resume to each job posting",
      "Instant cover letters in your voice — not robotic AI",
      "Application Q&A that reads naturally",
      "Fit analysis, interview prep & cross-app insights",
      "100 AI actions / month — predictable, no credit packs",
    ],
    highlighted: true,
    cta: "Go Pro",
    workspaceIncludes: [...WORKSPACE_CORE],
    aiSummary: `Full AI — all actions including tailor, cover letters, Q&A, prep, debrief, insights. ${PRO_AI_ACTIONS_CAP} actions/mo fair-use cap.`,
    entitlements: {
      aiEnabled: true,
      aiActionsPerMonth: PRO_AI_ACTIONS_CAP,
      coverLettersPerMonth: null,
      allowedAiActions: "all",
    },
  },
  {
    id: "standard",
    displayName: "Standard",
    price: "$4.99",
    period: "/month",
    badge: "Organize your search",
    description:
      "Organize your entire search — library, editor, tracking, and snapshots — when you prefer to write everything yourself.",
    marketingFeatures: [
      "Unlimited resume versions",
      "Full editor + 3 templates",
      "Application tracking & timeline",
      "Immutable send snapshots",
      "PDF export — flat monthly price",
    ],
    highlighted: false,
    cta: "Get Standard",
    workspaceIncludes: [...WORKSPACE_CORE],
    aiSummary: "No AI — full workspace only. Upgrade to Pro for tailoring, cover letters, and prep.",
    entitlements: {
      aiEnabled: false,
      aiActionsPerMonth: null,
      coverLettersPerMonth: null,
      allowedAiActions: "none",
    },
  },
];

export function normalizePlanTierId(
  value: string | null | undefined
): BillingPlanId | null {
  const raw = value?.trim().toLowerCase();
  if (!raw) return null;
  if (raw === LEGACY_ESSENTIALS_PLAN_ID) return "standard";
  if (raw === "student" || raw === "standard" || raw === "pro") {
    return raw;
  }
  return null;
}

export function getBillingPlan(id: BillingPlanId): BillingPlan {
  const plan = BILLING_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export function planTierDisplayName(id: BillingPlanId): string {
  return getBillingPlan(id).displayName;
}

export function studentAiActions(): string[] {
  return [...STUDENT_AI_ACTIONS];
}

export function proAiActions(): string[] {
  return [...PRO_AI_ACTIONS];
}

export function formatAllowedAiActions(plan: BillingPlan): string {
  switch (plan.entitlements.allowedAiActions) {
    case "none":
      return "None";
    case "student_subset":
      return STUDENT_AI_ACTIONS.join(", ");
    case "all":
      return "All AI features";
    default:
      return plan.entitlements.allowedAiActions.join(", ");
  }
}

/** Marketing card shape used on home/pricing pages. */
export function toPricingPlanCards() {
  return BILLING_PLANS.map((plan) => ({
    id: plan.id,
    name: plan.displayName,
    price: plan.price,
    period: plan.period,
    description: plan.description,
    features: plan.marketingFeatures,
    cta: plan.cta,
    highlighted: plan.highlighted,
    badge: plan.badge,
  }));
}
