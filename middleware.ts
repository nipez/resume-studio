import {
  applySecurityHeaders,
  buildHttpsRedirect,
  shouldRedirectToHttps,
} from "@/lib/request/security-headers";
import { APP_SESSION_COOKIE, readSession } from "@/lib/session";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/set-password",
  "/api/auth",
  "/api/health",
];

const PUBLIC_EXACT = new Set([
  "/",
  "/features",
  "/pricing",
  "/students",
  "/application-os",
  "/about",
  "/faq",
  "/privacy",
  "/terms",
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/blog")) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isStaticAsset(pathname: string): boolean {
  return /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname);
}

export async function middleware(request: NextRequest) {
  if (shouldRedirectToHttps(request)) {
    return buildHttpsRedirect(request);
  }

  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return applySecurityHeaders(request, NextResponse.next());
  }

  const session = readSession(request.cookies.get(APP_SESSION_COOKIE)?.value);
  const isPublic = isPublicPath(pathname);

  if (!session && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return applySecurityHeaders(request, NextResponse.redirect(loginUrl));
  }

  if (session && (pathname === "/login" || pathname === "/signup")) {
    const dest = request.nextUrl.clone();
    dest.pathname = "/dashboard";
    dest.search = "";
    return applySecurityHeaders(request, NextResponse.redirect(dest));
  }

  return applySecurityHeaders(request, NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
