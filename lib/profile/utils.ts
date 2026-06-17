/** Resolve the name shown in the UI and passed to AI prompts. */
export function resolveDisplayName(input: {
  profileFullName?: string | null;
  metadataFullName?: string | null;
  email?: string | null;
}): string {
  const fromProfile = input.profileFullName?.trim();
  if (fromProfile) return fromProfile;

  const fromMeta = input.metadataFullName?.trim();
  if (fromMeta) return fromMeta;

  const fromEmail = input.email?.split("@")[0]?.trim();
  if (fromEmail) return fromEmail;

  return "there";
}

export function resolveFirstName(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed || trimmed === "there") return "";
  return trimmed.split(/\s+/)[0] ?? "";
}

export function isEmailDerivedName(displayName: string, email?: string | null): boolean {
  const local = email?.split("@")[0]?.trim().toLowerCase();
  if (!local) return false;
  return displayName.trim().toLowerCase() === local;
}
