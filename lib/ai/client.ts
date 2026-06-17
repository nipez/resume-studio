import Anthropic from "@anthropic-ai/sdk";
import { resolveModelId } from "@/lib/ai/cost";
import type { ModelTier } from "@/lib/ai/config";

export class AIUnavailableError extends Error {
  constructor(message = "AI generation is unavailable. Add ANTHROPIC_API_KEY to enable it.") {
    super(message);
    this.name = "AIUnavailableError";
  }
}

export class AIMockModeError extends Error {
  constructor(message = "Demo mode — configure ANTHROPIC_API_KEY for real AI output.") {
    super(message);
    this.name = "AIMockModeError";
  }
}

export type AICompletionUsage = {
  inputTokens: number;
  outputTokens: number;
  model: string;
};

function getMaxTokens(): number {
  return Number(process.env.AI_MAX_TOKENS) || 4096;
}

export function isAIConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export async function complete(
  prompt: string,
  options?: { tier?: ModelTier }
): Promise<{ text: string; usage: AICompletionUsage }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new AIUnavailableError();
  }

  const tier = options?.tier ?? "quality";
  const model = resolveModelId(tier);
  const maxTokens = getMaxTokens();

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Empty AI response");
  }

  return {
    text: block.text,
    usage: {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      model,
    },
  };
}
