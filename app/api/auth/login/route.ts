import {
  attachSessionCookie,
  signInWithPassword,
} from "@/lib/auth";
import { getPublicOrigin } from "@/lib/request/public-origin";
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
  const loginUrl = new URL("/login", origin);

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

  if (!email || !password) {
    loginUrl.searchParams.set("error", "missing");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const auth = await signInWithPassword(email, password);
    const dest = safeNextPath(next);
    const response = NextResponse.redirect(new URL(dest, origin));
    return await attachSessionCookie(response, auth.userId, auth.email);
  } catch {
    loginUrl.searchParams.set("error", "invalid");
    if (next) loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }
}
