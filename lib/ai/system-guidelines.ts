import { createServiceClient } from "@/lib/supabase/server";

export type SystemGuidelines = {
  guidelines: string;
  bannedPhrases: string[];
  updatedAt: string | null;
};

const EMPTY_GUIDELINES: SystemGuidelines = {
  guidelines: "",
  bannedPhrases: [],
  updatedAt: null,
};

let cached: { value: SystemGuidelines; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

export function buildSystemGuidelinesBlock(
  input: Pick<SystemGuidelines, "guidelines" | "bannedPhrases">
): string {
  const rules = input.guidelines.trim();
  const phrases = input.bannedPhrases.map((p) => p.trim()).filter(Boolean);

  if (!rules && phrases.length === 0) return "";

  const lines = ["GLOBAL SYSTEM GUIDELINES (always obey):"];
  if (rules) lines.push(rules);
  if (phrases.length) {
    lines.push(
      "NEVER use these words or phrases (or close variants): " + phrases.join("; ")
    );
  }
  return lines.join("\n") + "\n\n";
}

export function invalidateSystemGuidelinesCache() {
  cached = null;
}

export async function getSystemGuidelines(): Promise<SystemGuidelines> {
  const now = Date.now();
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.value;
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("ai_system_guidelines")
      .select("guidelines, banned_phrases, updated_at")
      .eq("id", "default")
      .maybeSingle();

    if (error || !data) {
      return EMPTY_GUIDELINES;
    }

    const value: SystemGuidelines = {
      guidelines: data.guidelines ?? "",
      bannedPhrases: Array.isArray(data.banned_phrases)
        ? data.banned_phrases.filter(Boolean).map(String)
        : [],
      updatedAt: data.updated_at ?? null,
    };

    cached = { value, fetchedAt: now };
    return value;
  } catch {
    return EMPTY_GUIDELINES;
  }
}
