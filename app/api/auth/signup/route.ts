import { attachSessionCookie } from "@/lib/auth";
import { getAppUrl } from "@/lib/request/app-url";
import { getPublicOrigin } from "@/lib/request/public-origin";
import { setUserPassword } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}

export async function POST(request: NextRequest) {
  const origin = getPublicOrigin(request);
  const signupUrl = new URL("/signup", origin);

  let email = "";
  let password = "";
  let next: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
      next?: string;
    } | null;
    email = body?.email?.trim() ?? "";
    password = body?.password ?? "";
    next = body?.next ?? null;
  } else {
    const form = await request.formData();
    email = String(form.get("email") ?? "").trim();
    password = String(form.get("password") ?? "");
    next = String(form.get("next") ?? "") || null;
  }

  if (!email || password.length < 8) {
    signupUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(signupUrl);
  }

  try {
    const userId = await setUserPassword(email, password);
    const dest = safeNextPath(next);
    const response = NextResponse.redirect(new URL(dest, origin));
    return await attachSessionCookie(response, userId, email.toLowerCase());
  } catch {
    signupUrl.searchParams.set("error", "failed");
    return NextResponse.redirect(signupUrl);
  }
}

export async function GET() {
  return NextResponse.redirect(new URL("/signup", getAppUrl()));
}
