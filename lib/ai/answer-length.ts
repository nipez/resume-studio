export type AnswerLengthLimit =
  | { unit: "words"; max: number }
  | { unit: "characters"; max: number };

const WORD_LIMIT_RE =
  /(?:\bin\s+)?(?:no\s+more\s+than|not\s+more\s+than|fewer\s+than|less\s+than|under|up\s+to|at\s+most|maximum(?:\s+of)?|max(?:imum)?\.?|limit(?:ed)?\s*(?:to|of|:)?)\s*(\d{2,5})\s*words?(?:\s+or\s+less)?\b|\b(\d{2,5})\s*words?\s+or\s+less\b|\b(\d{2,5})[\s-]*word\s+limit\b|\bin\s+(\d{2,5})\s*words?\b/i;

const CHAR_LIMIT_RE =
  /(?:\bin\s+)?(?:no\s+more\s+than|not\s+more\s+than|fewer\s+than|less\s+than|under|up\s+to|at\s+most|maximum(?:\s+of)?|max(?:imum)?\.?|limit(?:ed)?\s*(?:to|of|:)?)\s*(\d{2,5})\s*(?:characters?|chars?)(?:\s+or\s+less)?\b|\b(\d{2,5})\s*(?:characters?|chars?)\s+or\s+less\b|\b(\d{2,5})[\s-]*(?:character|char)\s+limit\b/i;

/**
 * Pull an explicit length cap out of a job-application question
 * (e.g. "In 250 words or less…"). Returns null when none is stated.
 */
export function extractAnswerLengthLimit(
  question: string
): AnswerLengthLimit | null {
  const text = question.trim();
  if (!text) return null;

  const wordMatch = WORD_LIMIT_RE.exec(text);
  if (wordMatch) {
    const raw =
      wordMatch[1] || wordMatch[2] || wordMatch[3] || wordMatch[4] || "";
    const max = Number(raw);
    if (Number.isFinite(max) && max >= 20 && max <= 5000) {
      return { unit: "words", max };
    }
  }

  const charMatch = CHAR_LIMIT_RE.exec(text);
  if (charMatch) {
    const raw = charMatch[1] || charMatch[2] || charMatch[3] || "";
    const max = Number(raw);
    if (Number.isFinite(max) && max >= 40 && max <= 20_000) {
      return { unit: "characters", max };
    }
  }

  return null;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/** Instruction fragment for the model when a limit is present or default. */
export function answerLengthInstruction(
  limit: AnswerLengthLimit | null
): string {
  if (!limit) {
    return "120-180 words";
  }
  if (limit.unit === "words") {
    return (
      `at most ${limit.max} words (HARD LIMIT from the question — do not exceed ${limit.max} words; shorter is fine)`
    );
  }
  return (
    `at most ${limit.max} characters (HARD LIMIT from the question — do not exceed ${limit.max} characters; shorter is fine)`
  );
}

/**
 * Soft-enforce a length limit by truncating at the last sentence boundary
 * that still fits. Never invents content.
 */
export function enforceAnswerLengthLimit(
  text: string,
  limit: AnswerLengthLimit | null
): string {
  const trimmed = text.trim();
  if (!limit || !trimmed) return trimmed;

  if (limit.unit === "characters") {
    if (trimmed.length <= limit.max) return trimmed;
    const slice = trimmed.slice(0, limit.max);
    const sentenceEnd = Math.max(
      slice.lastIndexOf(". "),
      slice.lastIndexOf("! "),
      slice.lastIndexOf("? "),
      slice.lastIndexOf(".\n"),
      slice.lastIndexOf("!\n"),
      slice.lastIndexOf("?\n")
    );
    if (sentenceEnd >= Math.floor(limit.max * 0.4)) {
      return slice.slice(0, sentenceEnd + 1).trim();
    }
    const lastSpace = slice.lastIndexOf(" ");
    return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim();
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= limit.max) return trimmed;

  // Prefer ending on a sentence within the allowed word budget.
  let best = "";
  let count = 0;
  const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) ?? [
    trimmed,
  ];
  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean);
    if (count + sentenceWords.length > limit.max) break;
    best += (best ? " " : "") + sentence.trim();
    count += sentenceWords.length;
  }
  if (best && count >= Math.floor(limit.max * 0.4)) {
    return best.trim();
  }
  return words.slice(0, limit.max).join(" ").trim();
}
