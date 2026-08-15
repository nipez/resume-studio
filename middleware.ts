import {
  applySecurityHeaders,
  buildHttpsRedirect,
  shouldRedirectToHttps,
} from "@/lib/request/security-headers";
import {
  AGENT_API_KEY_HEADER,
  MCP_AUTHORIZATION_COPY_HEADER,
  tokenFromAuthorizationHeader,
} from "@/lib/mcp/auth-headers";
import { APP_SESSION_COOKIE, readSession } from "@/lib/session";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/set-password",
  "/api/auth",
  "/api/health",
  "/api/mcp",
  "/.well-known/oauth-protected-resource",
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

function isMcpPath(pathname: string): boolean {
  return pathname === "/api/mcp" || pathname.startsWith("/api/mcp/");
}

/**
 * Explicitly forward agent auth headers into the request Next.js will hand
 * to the route handler. Some hosts strip Authorization between the edge and
 * the Node handler; we mirror it onto x-mcp-authorization / x-agent-api-key.
 */
function nextWithMcpAuthHeaders(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  const authorization = request.headers.get("authorization");
  const agentKey = request.headers.get(AGENT_API_KEY_HEADER);

  if (authorization) {
    requestHeaders.set("authorization", authorization);
    requestHeaders.set(MCP_AUTHORIZATION_COPY_HEADER, authorization);
    const bearer = tokenFromAuthorizationHeader(authorization);
    if (bearer && !agentKey) {
      requestHeaders.set(AGENT_API_KEY_HEADER, bearer);
    }
  }
  if (agentKey) {
    requestHeaders.set(AGENT_API_KEY_HEADER, agentKey);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export async function middleware(request: NextRequest) {
  if (shouldRedirectToHttps(request)) {
    return buildHttpsRedirect(request);
  }

  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return applySecurityHeaders(request, NextResponse.next());
  }

  // MCP is bearer-key authenticated on the route; never redirect to /login.
  if (isMcpPath(pathname)) {
    return applySecurityHeaders(request, nextWithMcpAuthHeaders(request));
  }

  const session = await readSession(
    request.cookies.get(APP_SESSION_COOKIE)?.value
  );
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
