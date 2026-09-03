export function parseBannedPhrasesInput(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatBannedPhrasesInput(phrases: string[] | null | undefined): string {
  return Array.isArray(phrases) ? phrases.join("\n") : "";
}
