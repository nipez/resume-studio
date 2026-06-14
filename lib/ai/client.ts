import Anthropic from "@anthropic-ai/sdk";

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

function getConfig() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim() || "claude-sonnet-4-5";
  const maxTokens = Number(process.env.AI_MAX_TOKENS) || 4096;
  return { apiKey, model, maxTokens };
}

export function isAIConfigured(): boolean {
  return Boolean(getConfig().apiKey);
}

export async function complete(prompt: string): Promise<string> {
  const { apiKey, model, maxTokens } = getConfig();
  if (!apiKey) {
    throw new AIUnavailableError();
  }

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
  return block.text;
}
