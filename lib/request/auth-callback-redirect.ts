import { type NextRequest, NextResponse } from "next/server";

/** Supabase may land auth codes on Site URL (/) when redirect URL is not allowlisted. */
export function redirectAuthCallbackIfNeeded(
  request: NextRequest
): NextResponse | null {
  if (request.nextUrl.pathname === "/auth/callback") return null;

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!code && !(tokenHash && type)) return null;

  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";
  return NextResponse.redirect(url);
}
