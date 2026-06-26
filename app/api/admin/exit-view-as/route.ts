import { exitViewAsRoute } from "@/lib/admin/view-as-route";
import { getPublicOrigin } from "@/lib/request/public-origin";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** Full-page exit from view-as — restores the admin session then redirects. */
export async function GET(request: NextRequest) {
  try {
    return await exitViewAsRoute(request);
  } catch {
    const origin = getPublicOrigin(request);
    return NextResponse.redirect(
      new URL("/dashboard?admin_exit_failed=1", origin)
    );
  }
}
