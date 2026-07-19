import {
  addBusinessDays,
  dateISOFromTimestamp,
  daysBetween,
  scheduleForApplicationType,
} from "@/lib/applications/follow-up-schedule";
import { followUpEmailTemplate } from "@/lib/applications/follow-up-templates";
import type {
  Application,
  ApplicationEvent,
  ApplicationStatus,
} from "@/lib/applications/types";
import { applicationCurrentRank, todayISO } from "@/lib/applications/utils";

import type { FollowUpKind } from "@/lib/applications/follow-up-types";

export type { FollowUpKind };

export type FollowUpRecommendation = {
  id: FollowUpKind;
  eventType: "followup" | "note";
  title: string;
  suggestedDate: string;
  reason: string;
  tip: string;
  emailTemplate?: string;
  overdue: boolean;
  dueSoon: boolean;
  priority: number;
};

export type SuggestedFollowUp = FollowUpRecommendation & {
  appId: string;
  appTitle: string;
  company: string;
};

const REC_PREFIX = "[rec:";

export function recommendationMarker(id: FollowUpKind): string {
  return `${REC_PREFIX}${id}]`;
}

export function eventMatchesRecommendation(
  event: ApplicationEvent,
  id: FollowUpKind
): boolean {
  if (event.notes.includes(recommendationMarker(id))) return true;
  if (event.done) return false;

  const titles: Partial<Record<FollowUpKind, string[]>> = {
    interview_thank_you: ["thank", "thank-you", "thank you"],
    apply_followup_1: ["1st follow-up", "first follow-up"],
    apply_followup_2: ["2nd follow-up", "second follow-up"],
    apply_followup_3: ["3rd follow-up", "final follow-up"],
    interview_followup_1: ["status follow-up", "1st follow-up"],
    interview_followup_2: ["2nd follow-up"],
    interview_closure: ["closure", "closing note"],
  };

  const hay = `${event.title} ${event.notes}`.toLowerCase();
  return (titles[id] ?? []).some((needle) => hay.includes(needle));
}

function isTerminalStatus(status: ApplicationStatus): boolean {
  return (
    status === "offer" ||
    status === "rejected" ||
    status === "ghosted" ||
    status === "not_applied"
  );
}

function latestInterviewDate(app: Application): string | null {
  const datedInterviews = (app.events ?? [])
    .filter((e) => e.type === "interview" && e.date)
    .map((e) => e.date!)
    .sort()
    .reverse();
  if (datedInterviews.length) return datedInterviews[0];

  const interviewHistory = [...(app.status_history ?? [])]
    .reverse()
    .find((entry) => entry.status === "interview");
  if (interviewHistory) return dateISOFromTimestamp(interviewHistory.at);

  return null;
}

function hasInterviewStage(app: Application): boolean {
  if (latestInterviewDate(app)) return true;
  if (app.interview_debrief) return true;
  return applicationCurrentRank(app) >= 2;
}

function priorRecommendationDone(
  app: Application,
  priorId: FollowUpKind
): boolean {
  return (app.events ?? []).some(
    (e) => eventMatchesRecommendation(e, priorId) && e.done
  );
}

function priorRecommendationScheduled(
  app: Application,
  priorId: FollowUpKind
): boolean {
  return (app.events ?? []).some((e) => eventMatchesRecommendation(e, priorId));
}

function isDismissed(app: Application, id: FollowUpKind): boolean {
  return (app.follow_up_dismissed ?? []).includes(id);
}

function decorateRecommendation(
  rec: Omit<
    FollowUpRecommendation,
    "overdue" | "dueSoon" | "priority" | "emailTemplate"
  > & { emailTemplate?: string },
  today: string,
  priority: number
): FollowUpRecommendation {
  const overdue = rec.suggestedDate < today;
  const dueSoon = !overdue && daysBetween(today, rec.suggestedDate) <= 3;
  return { ...rec, overdue, dueSoon, priority };
}

function buildPostApplyRecommendations(
  app: Application,
  today: string
): FollowUpRecommendation[] {
  const schedule = scheduleForApplicationType(app.application_type);
  const anchor = dateISOFromTimestamp(app.applied_at);
  if (!anchor) return [];

  const specs: {
    id: FollowUpKind;
    offset: number;
    title: string;
    reason: string;
    tip: string;
    requiresPrior?: FollowUpKind;
  }[] = [
    {
      id: "apply_followup_1",
      offset: schedule.applyFirst,
      title: "1st follow-up",
      reason: `About ${schedule.applyFirst} business days after applying — a polite check-in while you're still fresh in their inbox.`,
      tip: "Keep it to 3–4 sentences. Reiterate interest; don't repeat your whole resume.",
    },
    {
      id: "apply_followup_2",
      offset: schedule.applySecond,
      title: "2nd follow-up",
      reason: "One week after your first follow-up — add a small detail or link, not just “checking in.”",
      tip: "Mention something specific about the company or role to show genuine interest.",
      requiresPrior: "apply_followup_1",
    },
    {
      id: "apply_followup_3",
      offset: schedule.applyThird,
      title: "Final follow-up",
      reason: "Last touch before moving on — gracious, brief, and leaves the door open.",
      tip: "Three follow-ups after applying is enough. Archive or mark ghosted if you hear nothing.",
      requiresPrior: "apply_followup_2",
    },
  ];

  const out: FollowUpRecommendation[] = [];
  for (let i = 0; i < specs.length; i += 1) {
    const spec = specs[i];
    if (isDismissed(app, spec.id)) continue;
    if (priorRecommendationScheduled(app, spec.id)) continue;
    if (spec.requiresPrior && !priorRecommendationDone(app, spec.requiresPrior)) {
      if (!priorRecommendationScheduled(app, spec.requiresPrior)) continue;
    }

    const suggestedDate = addBusinessDays(anchor, spec.offset);
    out.push(
      decorateRecommendation(
        {
          id: spec.id,
          eventType: "followup",
          title: spec.title,
          suggestedDate,
          reason: spec.reason,
          tip: spec.tip,
          emailTemplate: followUpEmailTemplate(spec.id, {
            role: app.role,
            company: app.company,
          }),
        },
        today,
        10 + i
      )
    );
  }

  return out;
}

function buildPostInterviewRecommendations(
  app: Application,
  today: string
): FollowUpRecommendation[] {
  const schedule = scheduleForApplicationType(app.application_type);
  const interviewDate = latestInterviewDate(app);
  const anchor = interviewDate ?? dateISOFromTimestamp(app.applied_at);
  if (!anchor) return [];

  const decisionBy = app.decision_by?.trim() || null;
  const debriefEmail = app.interview_debrief?.followUpEmail?.trim();

  const specs: {
    id: FollowUpKind;
    offset: number;
    title: string;
    reason: string;
    tip: string;
    eventType: "followup" | "note";
    requiresPrior?: FollowUpKind;
    useDecisionDate?: boolean;
  }[] = [
    {
      id: "interview_thank_you",
      offset: schedule.interviewThankYou,
      title: "Thank-you note",
      reason: "Within 24 hours of your interview — most candidates skip this; it helps you stand out.",
      tip: "Reference one specific thing you discussed. Use your debrief draft on the Prepare tab if you have one.",
      eventType: "followup",
    },
    {
      id: "interview_followup_1",
      offset: schedule.interviewFirst,
      title: "Status follow-up",
      reason: decisionBy
        ? `Their timeline was ${decisionBy} — follow up the next business day if you haven't heard.`
        : `About ${schedule.interviewFirst} business days after the interview if you haven't heard back.`,
      tip: "One clear question beats a long email. Ask about timeline or next steps.",
      eventType: "followup",
      requiresPrior: "interview_thank_you",
      useDecisionDate: Boolean(decisionBy),
    },
    {
      id: "interview_followup_2",
      offset: schedule.interviewSecond,
      title: "2nd follow-up",
      reason: "A brief second check-in shows continued interest without being pushy.",
      tip: "Shorter than your first follow-up — 2–3 sentences is fine.",
      eventType: "followup",
      requiresPrior: "interview_followup_1",
    },
    {
      id: "interview_closure",
      offset: schedule.interviewClosure,
      title: "Closing note",
      reason: "Gracious final message if you're still waiting — then focus energy on other opportunities.",
      tip: "Leave the relationship positive. You may cross paths with this team again.",
      eventType: "note",
      requiresPrior: "interview_followup_2",
    },
  ];

  const out: FollowUpRecommendation[] = [];
  for (let i = 0; i < specs.length; i += 1) {
    const spec = specs[i];
    if (isDismissed(app, spec.id)) continue;
    if (priorRecommendationScheduled(app, spec.id)) continue;
    if (spec.requiresPrior && !priorRecommendationDone(app, spec.requiresPrior)) {
      if (!priorRecommendationScheduled(app, spec.requiresPrior)) continue;
    }

    let suggestedDate: string;
    if (spec.useDecisionDate && decisionBy) {
      suggestedDate = addBusinessDays(decisionBy, 1);
    } else if (spec.id === "interview_thank_you" && interviewDate) {
      suggestedDate = addBusinessDays(interviewDate, spec.offset);
    } else if (spec.id === "interview_thank_you" && !interviewDate) {
      suggestedDate = addBusinessDays(anchor, spec.offset);
    } else {
      suggestedDate = addBusinessDays(interviewDate ?? anchor, spec.offset);
    }

    let emailTemplate = followUpEmailTemplate(spec.id, {
      role: app.role,
      company: app.company,
    });
    if (spec.id === "interview_thank_you" && debriefEmail) {
      emailTemplate = debriefEmail;
    }

    out.push(
      decorateRecommendation(
        {
          id: spec.id,
          eventType: spec.eventType,
          title: spec.title,
          suggestedDate,
          reason: spec.reason,
          tip: spec.tip,
          emailTemplate,
        },
        today,
        20 + i
      )
    );
  }

  return out;
}

export function computeFollowUpRecommendations(
  app: Application,
  today = todayISO()
): FollowUpRecommendation[] {
  if (isTerminalStatus(app.status)) return [];
  if (app.archived_at) return [];

  const postInterview = hasInterviewStage(app);
  const raw = postInterview
    ? buildPostInterviewRecommendations(app, today)
    : buildPostApplyRecommendations(app, today);

  return raw
    .filter((rec) => {
      const tooFarOut = daysBetween(today, rec.suggestedDate) > 14;
      if (tooFarOut && !rec.overdue) return false;
      return true;
    })
    .sort((a, b) => a.suggestedDate.localeCompare(b.suggestedDate));
}

export function computeSuggestedFollowUps(
  apps: Application[],
  today = todayISO()
): SuggestedFollowUp[] {
  const items: SuggestedFollowUp[] = [];

  for (const app of apps) {
    if (app.archived_at) continue;
    const recs = computeFollowUpRecommendations(app, today);
    const title =
      app.role?.trim() && app.company?.trim()
        ? `${app.role} · ${app.company}`
        : app.role?.trim() || app.company?.trim() || "Application";

    for (const rec of recs) {
      if (!rec.overdue && !rec.dueSoon && rec.suggestedDate > today) continue;
      items.push({
        ...rec,
        appId: app.id,
        appTitle: title,
        company: app.company,
      });
    }
  }

  return items.sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    return a.suggestedDate.localeCompare(b.suggestedDate);
  });
}

export function nextActionableRecommendation(
  app: Application,
  today = todayISO()
): FollowUpRecommendation | null {
  const recs = computeFollowUpRecommendations(app, today);
  return (
    recs.find((rec) => rec.overdue || rec.dueSoon || rec.suggestedDate <= today) ??
    recs[0] ??
    null
  );
}

export const FOLLOW_UP_LESSON = {
  title: "The follow-up most people skip",
  points: [
    {
      heading: "After you apply",
      body: "Wait about a week, then send one polite follow-up. It shows you're serious — not desperate.",
    },
    {
      heading: "After an interview",
      body: "Send a thank-you within 24 hours. Most candidates don't. It's an easy way to stand out.",
    },
    {
      heading: "One more nudge is fine",
      body: "A second follow-up a week later is professional. Three total touches is enough — then move on.",
    },
  ],
} as const;
