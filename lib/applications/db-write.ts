const OPTIONAL_APPLICATION_COLUMNS = [
  "job_url",
  "application_type",
  "hiring_contacts",
  "interview_transcript",
  "interview_debrief",
] as const;

export function isMissingApplicationColumnError(
  message: string,
  column: string
): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes(column.toLowerCase()) &&
    (lower.includes("schema cache") ||
      lower.includes("could not find") ||
      lower.includes("does not exist") ||
      lower.includes("column"))
  );
}

export function isOptionalApplicationColumnError(message: string): boolean {
  return OPTIONAL_APPLICATION_COLUMNS.some((column) =>
    isMissingApplicationColumnError(message, column)
  );
}

export function stripOptionalApplicationColumns(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const next = { ...payload };
  for (const column of OPTIONAL_APPLICATION_COLUMNS) {
    delete next[column];
  }
  return next;
}

export function stripApplicationColumn(
  payload: Record<string, unknown>,
  column: string
): Record<string, unknown> {
  const next = { ...payload };
  delete next[column];
  return next;
}
