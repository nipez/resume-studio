import {
  AI_COST_ALERT_USD,
  AI_ENFORCE_PLAN_TIERS,
  AI_PRO_MONTHLY_CAP,
  AI_STUDENT_COVER_LETTER_CAP,
  type AIAction,
  type PlanTier,
  isActionAllowedForTier,
} from "@/lib/ai/config";
import { estimateTokenCostUsd } from "@/lib/ai/cost";
import {
  AIFeatureNotAvailableError,
  AIQuotaExceededError,
} from "@/lib/ai/errors";
import { createServiceClient } from "@/lib/supabase/server";

export type AICompletionContext = {
  userId: string;
  planTier: PlanTier;
  action: AIAction;
};

export type AIUsageResult = {
  inputTokens: number;
  outputTokens: number;
  model: string;
};

function currentPeriodStart(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

async function getMonthlyTotals(userId: string) {
  const supabase = createServiceClient();
  const periodStart = currentPeriodStart();

  const { data: monthly, error: monthlyError } = await supabase
    .from("ai_usage_monthly")
    .select("action_count, estimated_cost_usd, cost_alert_sent")
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .maybeSingle();

  if (monthlyError) {
    console.error("[ai-usage] monthly read failed", monthlyError.message);
    return {
      periodStart,
      actionCount: 0,
      estimatedCostUsd: 0,
      costAlertSent: false,
      coverLetterCount: 0,
    };
  }

  const { count: coverLetterCount, error: coverError } = await supabase
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", "cover_letter")
    .gte("created_at", `${periodStart}T00:00:00.000Z`);

  if (coverError) {
    console.error("[ai-usage] cover letter count failed", coverError.message);
  }

  return {
    periodStart,
    actionCount: monthly?.action_count ?? 0,
    estimatedCostUsd: Number(monthly?.estimated_cost_usd ?? 0),
    costAlertSent: Boolean(monthly?.cost_alert_sent),
    coverLetterCount: coverLetterCount ?? 0,
  };
}

export async function assertAIAllowed(ctx: AICompletionContext): Promise<void> {
  if (AI_ENFORCE_PLAN_TIERS) {
    const gate = isActionAllowedForTier(ctx.action, ctx.planTier);
    if (!gate.allowed) {
      throw new AIFeatureNotAvailableError(gate.reason);
    }
  }

  const totals = await getMonthlyTotals(ctx.userId);

  if (
    AI_ENFORCE_PLAN_TIERS &&
    ctx.planTier === "student" &&
    ctx.action === "cover_letter" &&
    totals.coverLetterCount >= AI_STUDENT_COVER_LETTER_CAP
  ) {
    throw new AIQuotaExceededError(
      `Student plan includes ${AI_STUDENT_COVER_LETTER_CAP} AI cover letters per month. Upgrade to Pro for more.`
    );
  }

  if (totals.actionCount >= AI_PRO_MONTHLY_CAP) {
    throw new AIQuotaExceededError(
      `You've used all ${AI_PRO_MONTHLY_CAP} AI actions this month. Your limit resets on the 1st.`
    );
  }
}

async function maybeSendCostAlert(input: {
  userId: string;
  periodStart: string;
  estimatedCostUsd: number;
  costAlertSent: boolean;
  action: AIAction;
  model: string;
}) {
  if (
    input.costAlertSent ||
    input.estimatedCostUsd < AI_COST_ALERT_USD
  ) {
    return;
  }

  console.error(
    "[ai-cost-alert]",
    JSON.stringify({
      userId: input.userId,
      periodStart: input.periodStart,
      estimatedCostUsd: input.estimatedCostUsd.toFixed(4),
      thresholdUsd: AI_COST_ALERT_USD,
      lastAction: input.action,
      model: input.model,
    })
  );

  const supabase = createServiceClient();
  await supabase
    .from("ai_usage_monthly")
    .update({ cost_alert_sent: true })
    .eq("user_id", input.userId)
    .eq("period_start", input.periodStart);
}

export async function recordAIUsage(
  ctx: AICompletionContext,
  usage: AIUsageResult
): Promise<void> {
  const supabase = createServiceClient();
  const periodStart = currentPeriodStart();
  const costDelta = estimateTokenCostUsd(
    usage.model,
    usage.inputTokens,
    usage.outputTokens
  );

  const totals = await getMonthlyTotals(ctx.userId);
  const nextActionCount = totals.actionCount + 1;
  const nextCost = totals.estimatedCostUsd + costDelta;

  const { error: monthlyError } = await supabase.from("ai_usage_monthly").upsert(
    {
      user_id: ctx.userId,
      period_start: periodStart,
      action_count: nextActionCount,
      estimated_cost_usd: nextCost,
      cost_alert_sent: totals.costAlertSent,
    },
    { onConflict: "user_id,period_start" }
  );

  if (monthlyError) {
    console.error("[ai-usage] monthly upsert failed", monthlyError.message);
  }

  const { error: eventError } = await supabase.from("ai_usage_events").insert({
    user_id: ctx.userId,
    action: ctx.action,
    model: usage.model,
    input_tokens: usage.inputTokens,
    output_tokens: usage.outputTokens,
    estimated_cost_usd: costDelta,
  });

  if (eventError) {
    console.error("[ai-usage] event insert failed", eventError.message);
  }

  await maybeSendCostAlert({
    userId: ctx.userId,
    periodStart,
    estimatedCostUsd: nextCost,
    costAlertSent: totals.costAlertSent,
    action: ctx.action,
    model: usage.model,
  });
}
