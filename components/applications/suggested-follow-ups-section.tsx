"use client";

import type { SuggestedFollowUp } from "@/lib/applications/insights";
import { formatDay } from "@/lib/applications/utils";
import Link from "next/link";

export function SuggestedFollowUpsSection({
  items,
  title = "Suggested follow-ups",
  compact = false,
}: {
  items: SuggestedFollowUp[];
  title?: string;
  compact?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className={`rounded-2xl border border-border bg-white ${compact ? "p-5" : "p-6"}`}>
      <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-[12.5px] text-muted">
        Smart reminders based on when you applied or interviewed — most candidates
        skip these.
      </p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <Link
            key={`${item.appId}-${item.id}`}
            href={`/applications/${item.appId}`}
            className="flex items-start gap-3 rounded-xl border border-[#E8F0FF] bg-[#F7FAFF] px-3.5 py-2.5 transition-colors hover:border-[#CFE0FF] hover:bg-[#EEF4FF]"
          >
            <div
              className={`flex-none rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                item.overdue
                  ? "bg-[#FCECEC] text-[#B23B3B]"
                  : "bg-[#EAF1FF] text-[#1E54E6]"
              }`}
            >
              {item.overdue ? "Due" : formatDay(item.suggestedDate)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink">
                {item.title}
                {item.overdue ? (
                  <span className="ml-1.5 text-[11px] font-semibold text-[#B23B3B]">
                    overdue
                  </span>
                ) : null}
              </div>
              <div className="truncate text-[12px] text-muted">
                {item.appTitle}
                {item.company ? ` · ${item.company}` : ""}
              </div>
              <div className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-[#8A92A0]">
                {item.reason}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
