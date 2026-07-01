"use client";

import {
  addFollowUpFromRecommendation,
  dismissFollowUpRecommendation,
} from "@/lib/applications/actions";
import type { FollowUpRecommendation } from "@/lib/applications/follow-up-recommendations";
import { FOLLOW_UP_LESSON } from "@/lib/applications/follow-up-recommendations";
import type { FollowUpKind } from "@/lib/applications/follow-up-types";
import { formatDay } from "@/lib/applications/utils";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useMemo, useState, useTransition, type TransitionStartFunction } from "react";

type FollowUpRecommendationsPanelProps = {
  applicationId: string;
  recommendations: FollowUpRecommendation[];
  showLesson?: boolean;
  startTransition: TransitionStartFunction;
  router: AppRouterInstance;
  onEventAdded?: (recommendationId: FollowUpKind) => void;
  onDismissed: (recommendationId: FollowUpKind) => void;
};

export function FollowUpRecommendationsPanel({
  applicationId,
  recommendations,
  showLesson = false,
  startTransition,
  router,
  onEventAdded,
  onDismissed,
}: FollowUpRecommendationsPanelProps) {
  const [pending, startLocal] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visible = useMemo(
    () => recommendations.slice(0, 3),
    [recommendations]
  );

  if (visible.length === 0 && !showLesson) return null;

  async function copyEmail(rec: FollowUpRecommendation) {
    if (!rec.emailTemplate?.trim()) return;
    try {
      await navigator.clipboard.writeText(rec.emailTemplate);
      setCopiedId(rec.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mb-4 flex flex-col gap-3">
      {showLesson ? (
        <div className="rounded-xl border border-[#D9E4FF] bg-[#F7FAFF] px-4 py-3.5">
          <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#2456D6]">
            Pro tip
          </div>
          <div className="mt-1 text-[14px] font-semibold text-ink">
            {FOLLOW_UP_LESSON.title}
          </div>
          <ul className="mt-2 space-y-1.5 text-[12.5px] leading-[1.5] text-[#5A6573]">
            {FOLLOW_UP_LESSON.points.map((point) => (
              <li key={point.heading}>
                <span className="font-semibold text-ink">{point.heading}:</span>{" "}
                {point.body}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {visible.map((rec) => (
        <div
          key={rec.id}
          className="rounded-xl border border-[#D9E4FF] bg-[#F7FAFF] px-4 py-3.5"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-ink">{rec.title}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.04em] ${
                    rec.overdue
                      ? "bg-[#FCECEC] text-[#B23B3B]"
                      : "bg-[#EAF1FF] text-[#2456D6]"
                  }`}
                >
                  {rec.overdue ? "Due now" : formatDay(rec.suggestedDate)}
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[#5A6573]">
                {rec.reason}
              </p>
              <p className="mt-1 text-[12px] leading-[1.45] text-[#8A92A0]">{rec.tip}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await addFollowUpFromRecommendation(applicationId, rec);
                  onEventAdded?.(rec.id);
                  router.refresh();
                })
              }
              className="cursor-pointer rounded-lg border-none bg-[#2456D6] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-50"
            >
              Add to timeline
            </button>
            {rec.emailTemplate ? (
              <button
                type="button"
                onClick={() => startLocal(() => copyEmail(rec))}
                className="cursor-pointer rounded-lg border border-[#CFE0FF] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#2456D6] hover:bg-[#EEF3FF]"
              >
                {copiedId === rec.id ? "Copied" : "Copy email draft"}
              </button>
            ) : null}
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await dismissFollowUpRecommendation(applicationId, rec.id);
                  onDismissed(rec.id);
                  router.refresh();
                })
              }
              className="cursor-pointer rounded-lg border-none bg-transparent px-2 py-1.5 text-[12px] font-semibold text-[#8A92A0] hover:text-[#5A6573] disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
