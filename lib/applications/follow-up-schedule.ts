/** Business-day date helpers for follow-up recommendations. */

export function dateISOFromTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addBusinessDays(fromDateISO: string, days: number): string {
  if (!fromDateISO || days <= 0) return fromDateISO;
  const d = new Date(`${fromDateISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return fromDateISO;

  let remaining = days;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) remaining -= 1;
  }

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(`${fromISO}T12:00:00`);
  const b = new Date(`${toISO}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export type FollowUpSchedule = {
  applyFirst: number;
  applySecond: number;
  applyThird: number;
  interviewThankYou: number;
  interviewFirst: number;
  interviewSecond: number;
  interviewClosure: number;
};

export function scheduleForApplicationType(
  applicationType: import("@/lib/applications/types").ApplicationType | null | undefined
): FollowUpSchedule {
  const fast =
    applicationType === "part_time" ||
    applicationType === "internship" ||
    applicationType === "volunteer";

  if (fast) {
    return {
      applyFirst: 5,
      applySecond: 12,
      applyThird: 19,
      interviewThankYou: 1,
      interviewFirst: 7,
      interviewSecond: 12,
      interviewClosure: 19,
    };
  }

  return {
    applyFirst: 7,
    applySecond: 14,
    applyThird: 21,
    interviewThankYou: 1,
    interviewFirst: 7,
    interviewSecond: 12,
    interviewClosure: 19,
  };
}
