import { type NextRequest, NextResponse } from "next/server";

function configuredProductionHost(): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return null;
  try {
    return new URL(siteUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isProductionHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname || hostname.includes("localhost") || hostname.startsWith("127.0.0.1")) {
    return false;
  }

  const configured = configuredProductionHost();
  if (configured && hostname === configured) return true;

  return hostname === "resumetrakr.com";
}

export function shouldRedirectToHttps(request: NextRequest): boolean {
  const host = request.headers.get("host")?.split(",")[0]?.trim() ?? "";
  if (!isProductionHost(host)) return false;

  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();

  if (forwardedProto === "http") return true;

  return request.nextUrl.protocol === "http:";
}

export function buildHttpsRedirect(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.protocol = "https:";
  return NextResponse.redirect(url, 308);
}

export function applySecurityHeaders(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const host = request.headers.get("host")?.split(",")[0]?.trim() ?? "";
  if (!isProductionHost(host)) return response;

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Content-Security-Policy", "upgrade-insecure-requests");

  return response;
}
