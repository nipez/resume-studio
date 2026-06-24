import { SITE_URL } from "@/lib/marketing/content";

/** Canonical public origin (always https in production config). */
export function getConfiguredSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      // fall through
    }
  }
  return SITE_URL;
}

/** Magic-link callback — must stay on https://resumetrakr.com, not window.location.origin. */
export function getAuthCallbackUrl(): string {
  return `${getConfiguredSiteOrigin()}/auth/callback`;
}
