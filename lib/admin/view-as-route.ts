import { isAdminEmail } from "@/lib/auth/admin";
import {
  attachSessionCookie,
  readSessionFromRequest,
} from "@/lib/auth";
import {
  IMPERSONATOR_COOKIE,
  decodeImpersonator,
  encodeImpersonator,
} from "@/lib/admin/impersonation";
import { findUserIdByEmail } from "@/lib/supabase/admin";
import { getPublicOrigin } from "@/lib/request/public-origin";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

async function resolveUserEmail(userId: string): Promise<string> {
  const svc = createServiceClient();
  const { data, error } = await svc.auth.admin.getUserById(userId);
  if (error || !data.user?.email) {
    throw new Error("User not found");
  }
  return data.user.email;
}

function impersonatorCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  };
}

/** Start view-as from a route handler — swap app session to the target user. */
export async function startViewingAsUserRoute(
  request: NextRequest,
  userId: string
): Promise<NextResponse> {
  const origin = getPublicOrigin(request);
  const dashboard = new URL("/dashboard", origin);
  const failed = new URL("/admin?view_as_failed=1", origin);

  const adminSession = readSessionFromRequest(request);
  if (!adminSession || !isAdminEmail(adminSession.email)) {
    return NextResponse.redirect(failed);
  }

  const email = await resolveUserEmail(userId);

  if (isAdminEmail(email)) {
    return NextResponse.redirect(failed);
  }

  if (email.toLowerCase() === adminSession.email.toLowerCase()) {
    return NextResponse.redirect(failed);
  }

  let response = NextResponse.redirect(dashboard);
  response = attachSessionCookie(response, userId, email);
  response.cookies.set(
    IMPERSONATOR_COOKIE,
    encodeImpersonator(adminSession.email),
    impersonatorCookieOptions()
  );

  return response;
}

/** Exit view-as — restore the admin app session. */
export async function exitViewAsRoute(request: NextRequest): Promise<NextResponse> {
  const origin = getPublicOrigin(request);
  const adminUrl = new URL("/admin", origin);
  const failed = new URL("/dashboard?admin_exit_failed=1", origin);

  const impersonator = request.cookies.get(IMPERSONATOR_COOKIE)?.value;
  if (!impersonator) {
    return NextResponse.redirect(failed);
  }

  const adminEmail = decodeImpersonator(impersonator);
  if (!adminEmail || !isAdminEmail(adminEmail)) {
    const response = NextResponse.redirect(failed);
    response.cookies.delete(IMPERSONATOR_COOKIE);
    return response;
  }

  const adminUserId = await findUserIdByEmail(adminEmail);
  if (!adminUserId) {
    const response = NextResponse.redirect(failed);
    response.cookies.delete(IMPERSONATOR_COOKIE);
    return response;
  }

  let response = NextResponse.redirect(adminUrl);
  response = attachSessionCookie(response, adminUserId, adminEmail);
  response.cookies.delete(IMPERSONATOR_COOKIE);
  return response;
}
