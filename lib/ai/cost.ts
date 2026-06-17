export function resolveModelId(tier: "fast" | "quality"): string {
  if (tier === "fast") {
    return (
      process.env.AI_MODEL_FAST?.trim() ||
      process.env.AI_HAIKU_MODEL?.trim() ||
      "claude-haiku-4-5"
    );
  }
  return process.env.AI_MODEL?.trim() || "claude-sonnet-4-5";
}

/** Rough USD estimate from token counts — used for cost alerts, not billing. */
export function estimateTokenCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const modelLower = model.toLowerCase();
  const isHaiku = modelLower.includes("haiku");
  const inputRate = isHaiku ? 1 / 1_000_000 : 3 / 1_000_000;
  const outputRate = isHaiku ? 5 / 1_000_000 : 15 / 1_000_000;
  return inputTokens * inputRate + outputTokens * outputRate;
}
