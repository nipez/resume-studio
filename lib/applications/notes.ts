export type ApplicationNote = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt?: string;
};

function isNoteEntry(value: unknown): value is ApplicationNote {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.body === "string" &&
    typeof row.createdAt === "string"
  );
}

function newNoteId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Parse stored notes — supports legacy plain text and JSON note arrays. */
export function parseApplicationNotes(
  raw: string | null | undefined,
  fallbackCreatedAt?: string | null
): ApplicationNote[] {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed) && parsed.every(isNoteEntry)) {
      return parsed
        .map((note) => ({
          id: note.id,
          body: note.body,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        }))
        .filter((note) => note.body.trim().length > 0);
    }
  } catch {
    // Legacy plain-text notes
  }

  return [
    {
      id: "legacy",
      body: trimmed,
      createdAt: fallbackCreatedAt || new Date().toISOString(),
    },
  ];
}

export function serializeApplicationNotes(notes: ApplicationNote[]): string {
  const cleaned = notes
    .map((note) => ({
      id: note.id || newNoteId(),
      body: note.body.trim(),
      createdAt: note.createdAt,
      ...(note.updatedAt ? { updatedAt: note.updatedAt } : {}),
    }))
    .filter((note) => note.body.length > 0);

  if (cleaned.length === 0) return "";
  return JSON.stringify(cleaned);
}

export function createApplicationNote(body: string): ApplicationNote {
  return {
    id: newNoteId(),
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
}

export function formatNoteTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
