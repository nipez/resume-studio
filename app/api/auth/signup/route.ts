import { attachSessionCookie } from "@/lib/auth";
import {
  attachInviteCodeUser,
  consumeInviteCode,
  parseInviteCode,
  releaseInviteCode,
} from "@/lib/auth/invite-codes";
import { getAppUrl } from "@/lib/request/app-url";
import { getPublicOrigin } from "@/lib/request/public-origin";
import { findUserIdByEmail, setUserPassword } from "@/lib/supabase/admin";
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
  let fullName = "";
  let inviteCode = "";
  let next: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
      fullName?: string;
      name?: string;
      inviteCode?: string;
      next?: string;
    } | null;
    email = body?.email?.trim() ?? "";
    password = body?.password ?? "";
    fullName = (body?.fullName ?? body?.name ?? "").trim();
    inviteCode = body?.inviteCode?.trim() ?? "";
    next = body?.next ?? null;
  } else {
    const form = await request.formData();
    email = String(form.get("email") ?? "").trim();
    password = String(form.get("password") ?? "");
    fullName = String(form.get("fullName") ?? form.get("name") ?? "").trim();
    inviteCode = String(form.get("inviteCode") ?? "").trim();
    next = String(form.get("next") ?? "") || null;
  }

  if (inviteCode) {
    signupUrl.searchParams.set("code", inviteCode);
  }

  if (!email || password.length < 8 || fullName.length < 1 || fullName.length > 80) {
    signupUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(signupUrl);
  }

  if (!parseInviteCode(inviteCode)) {
    signupUrl.searchParams.set("error", "invite");
    return NextResponse.redirect(signupUrl);
  }

  try {
    const existingId = await findUserIdByEmail(email);
    if (existingId) {
      signupUrl.searchParams.set("error", "exists");
      return NextResponse.redirect(signupUrl);
    }

    const consumed = await consumeInviteCode(inviteCode);
    if (!consumed) {
      signupUrl.searchParams.set("error", "invite");
      return NextResponse.redirect(signupUrl);
    }

    try {
      const userId = await setUserPassword(email, password, fullName);
      await attachInviteCodeUser(consumed.id, userId);
      const dest = safeNextPath(next);
      const response = NextResponse.redirect(new URL(dest, origin));
      return await attachSessionCookie(response, userId, email.toLowerCase());
    } catch {
      await releaseInviteCode(consumed.id);
      signupUrl.searchParams.set("error", "failed");
      return NextResponse.redirect(signupUrl);
    }
  } catch {
    signupUrl.searchParams.set("error", "failed");
    return NextResponse.redirect(signupUrl);
  }
}

export async function GET() {
  return NextResponse.redirect(new URL("/signup", getAppUrl()));
}
