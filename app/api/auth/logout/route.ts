import { clearSessionCookie } from "@/lib/auth";
import { getPublicOrigin } from "@/lib/request/public-origin";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = getPublicOrigin(request);
  const response = NextResponse.redirect(new URL("/login", origin));
  return clearSessionCookie(response);
}

export async function POST(request: NextRequest) {
  return GET(request);
}
