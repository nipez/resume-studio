import { getPublicOrigin } from "@/lib/request/public-origin";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

function safeNextPath(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return "/dashboard";
}

function loginErrorRedirect(request: NextRequest, reason?: string): NextResponse {
  const origin = getPublicOrigin(request);
  const url = new URL("/login", origin);
  url.searchParams.set("error", "auth");
  if (reason) url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

/** Exchange Supabase auth params server-side and persist session cookies on redirect. */
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return loginErrorRedirect(request, "config");
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const dest = safeNextPath(searchParams.get("next"));
  const origin = getPublicOrigin(request);

  if (!code && !(tokenHash && type)) {
    return loginErrorRedirect(request, "missing");
  }

  let response = NextResponse.redirect(new URL(dest, origin));

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.redirect(new URL(dest, origin));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const reason = error.message.toLowerCase().includes("code verifier")
        ? "pkce"
        : "exchange";
      return loginErrorRedirect(request, reason);
    }
    return response;
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash!,
    type: type as EmailOtpType,
  });

  if (error) {
    return loginErrorRedirect(request, "otp");
  }

  return response;
}
