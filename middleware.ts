import { type NextRequest } from "next/server";
import { redirectAuthCallbackIfNeeded } from "@/lib/request/auth-callback-redirect";
import {
  applySecurityHeaders,
  buildHttpsRedirect,
  shouldRedirectToHttps,
} from "@/lib/request/security-headers";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (shouldRedirectToHttps(request)) {
    return buildHttpsRedirect(request);
  }

  const authCallbackRedirect = redirectAuthCallbackIfNeeded(request);
  if (authCallbackRedirect) {
    return applySecurityHeaders(request, authCallbackRedirect);
  }

  const response = await updateSession(request);
  return applySecurityHeaders(request, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
