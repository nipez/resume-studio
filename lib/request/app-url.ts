import { SITE_URL } from "@/lib/marketing/content";

/** Public app origin for auth redirects and emails. */
export function getAppUrl(): string {
  const appUrl = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (appUrl) {
    try {
      return new URL(appUrl).origin;
    } catch {
      // fall through
    }
  }
  return SITE_URL;
}

export function appPath(path: string): string {
  return new URL(path, getAppUrl()).toString();
}
