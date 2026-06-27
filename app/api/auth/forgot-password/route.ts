import { getAppUrl, appPath } from "@/lib/request/app-url";
import { getPublicOrigin } from "@/lib/request/public-origin";
import { sendPasswordRecovery } from "@/lib/supabase/admin";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const origin = getPublicOrigin(request);
  const forgotUrl = new URL("/forgot-password", origin);

  let email = "";
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as { email?: string } | null;
    email = body?.email?.trim() ?? "";
  } else {
    const form = await request.formData();
    email = String(form.get("email") ?? "").trim();
  }

  if (!email) {
    forgotUrl.searchParams.set("error", "missing");
    return NextResponse.redirect(forgotUrl);
  }

  try {
    await sendPasswordRecovery(email, appPath("/set-password"));
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    if (message.includes("rate")) {
      forgotUrl.searchParams.set("error", "rate");
      return NextResponse.redirect(forgotUrl);
    }
  }

  forgotUrl.searchParams.set("sent", "1");
  return NextResponse.redirect(forgotUrl);
}

export async function GET() {
  return NextResponse.redirect(new URL("/forgot-password", getAppUrl()));
}
