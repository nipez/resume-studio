import { startViewingAsUserRoute } from "@/lib/admin/view-as-route";
import { getPublicOrigin } from "@/lib/request/public-origin";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** Full-page view-as — sets impersonator cookie, swaps session, redirects. */
export async function GET(request: NextRequest) {
  const origin = getPublicOrigin(request);
  const userId = new URL(request.url).searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.redirect(new URL("/admin?view_as_failed=1", origin));
  }

  try {
    return await startViewingAsUserRoute(request, userId);
  } catch {
    return NextResponse.redirect(new URL("/admin?view_as_failed=1", origin));
  }
}
