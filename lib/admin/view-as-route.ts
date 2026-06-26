import { isAdminEmail, isAdminUser } from "@/lib/auth/admin";
import {
  IMPERSONATOR_COOKIE,
  decodeImpersonator,
  encodeImpersonator,
} from "@/lib/admin/impersonation";
import { establishSessionWithClient } from "@/lib/admin/session";
import { getPublicOrigin } from "@/lib/request/public-origin";
import { createSupabaseRouteClient } from "@/lib/supabase/route-client";
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

/** Start view-as from a route handler — cookies must land on the redirect response. */
export async function startViewingAsUserRoute(
  request: NextRequest,
  userId: string
): Promise<NextResponse> {
  const origin = getPublicOrigin(request);
  const dashboard = new URL("/dashboard", origin);
  const failed = new URL("/admin?view_as_failed=1", origin);

  const { supabase, getResponse } = createSupabaseRouteClient(
    request,
    () => NextResponse.redirect(dashboard)
  );

  const {
    data: { user: admin },
  } = await supabase.auth.getUser();
  if (!isAdminUser(admin)) {
    return NextResponse.redirect(failed);
  }

  const email = await resolveUserEmail(userId);

  if (isAdminEmail(email)) {
    return NextResponse.redirect(failed);
  }

  if (email.toLowerCase() === admin!.email?.toLowerCase()) {
    return NextResponse.redirect(failed);
  }

  await establishSessionWithClient(email, supabase);

  const response = getResponse();
  response.cookies.set(
    IMPERSONATOR_COOKIE,
    encodeImpersonator(admin!.email!),
    impersonatorCookieOptions()
  );

  return response;
}

/** Exit view-as from a route handler — restore admin session on the redirect response. */
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

  const { supabase, getResponse } = createSupabaseRouteClient(
    request,
    () => NextResponse.redirect(adminUrl)
  );

  await establishSessionWithClient(adminEmail, supabase);

  const response = getResponse();
  response.cookies.delete(IMPERSONATOR_COOKIE);
  return response;
}
