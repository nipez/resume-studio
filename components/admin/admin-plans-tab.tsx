"use client";

import {
  AI_ENFORCE_PLAN_TIERS,
  AI_PRO_MONTHLY_CAP,
  AI_STUDENT_COVER_LETTER_CAP,
} from "@/lib/ai/config";
import {
  BILLING_PLANS,
  formatAllowedAiActions,
  type BillingPlan,
} from "@/lib/billing/plans";

export function AdminPlansTab() {
  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-[#CFE0FF] bg-[#EAF1FF] px-5 py-4 text-[13.5px] leading-relaxed text-[#2b3140]">
        <div className="font-display text-[14px] font-semibold text-[#1E54E6]">
          Pilot mode
        </div>
        <p className="mt-1.5">
          {AI_ENFORCE_PLAN_TIERS ? (
            <>
              <strong>Plan tiers are enforced.</strong> Users get AI access based on
              their <code className="rounded bg-white/60 px-1">plan_tier</code> in
              Supabase (student · standard · pro). Legacy{" "}
              <code className="rounded bg-white/60 px-1">essentials</code> maps to
              Standard.
            </>
          ) : (
            <>
              <strong>Everyone currently gets Pro AI.</strong>{" "}
              <code className="rounded bg-white/60 px-1">AI_ENFORCE_PLAN_TIERS</code>{" "}
              is off — tier gates below are what will apply at launch when you flip
              that env var to <code className="rounded bg-white/60 px-1">true</code>.
            </>
          )}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {BILLING_PLANS.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-white px-6 py-5">
        <h3 className="font-display text-[15px] font-semibold text-ink">
          Fair-use caps (when tiers enforced)
        </h3>
        <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-[#3a4350]">
          <li>
            <strong>Pro:</strong> {AI_PRO_MONTHLY_CAP} AI actions per calendar month
            (each generation = 1 action).
          </li>
          <li>
            <strong>Student:</strong> {AI_STUDENT_COVER_LETTER_CAP} AI cover letters
            per month; plus parse resume &amp; apply context assist only.
          </li>
          <li>
            <strong>Standard:</strong> no AI endpoints.
          </li>
        </ul>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: BillingPlan }) {
  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white p-5 ${
        plan.highlighted
          ? "border-accent/35 shadow-[0_8px_28px_rgba(47,107,255,0.12)]"
          : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-[18px] font-semibold text-ink">
          {plan.displayName}
        </h3>
        {plan.highlighted ? (
          <span className="rounded-full bg-[#EEF3FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            Recommended
          </span>
        ) : null}
      </div>
      <div className="mt-1 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8A92A0]">
        {plan.badge}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-[28px] font-semibold text-ink">
          {plan.price}
        </span>
        <span className="text-[13px] text-muted">{plan.period}</span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{plan.description}</p>

      <div className="mt-4 border-t border-[#EEF0F3] pt-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
          Workspace
        </div>
        <ul className="mt-2 space-y-1.5">
          {plan.workspaceIncludes.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-[12.5px] leading-snug text-[#3a4350]"
            >
              <span className="text-[#0E7C4B]">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 border-t border-[#EEF0F3] pt-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
          AI entitlements
        </div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-[#3a4350]">
          {plan.aiSummary}
        </p>
        <dl className="mt-3 space-y-2 text-[12px]">
          <Row
            label="AI enabled"
            value={plan.entitlements.aiEnabled ? "Yes" : "No"}
          />
          <Row label="Allowed actions" value={formatAllowedAiActions(plan)} />
          {plan.entitlements.aiActionsPerMonth != null ? (
            <Row
              label="Monthly action cap"
              value={String(plan.entitlements.aiActionsPerMonth)}
            />
          ) : null}
          {plan.entitlements.coverLettersPerMonth != null ? (
            <Row
              label="Cover letters / mo"
              value={String(plan.entitlements.coverLettersPerMonth)}
            />
          ) : null}
          <Row label="DB plan_tier" value={plan.id} mono />
        </dl>
      </div>

      <div className="mt-4 border-t border-[#EEF0F3] pt-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
          Marketing bullets
        </div>
        <ul className="mt-2 space-y-1.5">
          {plan.marketingFeatures.map((item) => (
            <li key={item} className="text-[12px] leading-snug text-muted">
              · {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd
        className={`text-right font-semibold text-ink ${mono ? "font-mono text-[11px]" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
