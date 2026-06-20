import { startViewingAsUser } from "@/lib/admin/view-as-session";
import { getPublicOrigin } from "@/lib/request/public-origin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Full-page view-as — sets impersonator cookie, swaps session, redirects. */
export async function GET(request: Request) {
  const origin = getPublicOrigin(request);
  const userId = new URL(request.url).searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.redirect(new URL("/admin?view_as_failed=1", origin));
  }

  try {
    await startViewingAsUser(userId);
    return NextResponse.redirect(new URL("/dashboard", origin));
  } catch {
    return NextResponse.redirect(new URL("/admin?view_as_failed=1", origin));
  }
}
