import { restoreAdminFromImpersonation } from "@/lib/admin/restore-session";
import { getPublicOrigin } from "@/lib/request/public-origin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Full-page exit from view-as — restores the admin session then redirects. */
export async function GET(request: Request) {
  const origin = getPublicOrigin(request);

  try {
    await restoreAdminFromImpersonation();
    return NextResponse.redirect(new URL("/admin", origin));
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard?admin_exit_failed=1", origin)
    );
  }
}
