import {
  APP_SESSION_COOKIE,
  createSessionPayload,
  readSession,
  sessionCookieOptions,
  signSession,
  type SessionPayload,
} from "@/lib/session";
import { createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest, NextResponse } from "next/server";

export type { SessionPayload };

export type AuthUser = {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
};

export async function readSessionFromRequest(
  request: NextRequest
): Promise<SessionPayload | null> {
  return readSession(request.cookies.get(APP_SESSION_COOKIE)?.value);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  return readSession(cookieStore.get(APP_SESSION_COOKIE)?.value);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;
  return { id: session.userId, email: session.email };
}

export async function requireAuthUser(): Promise<AuthUser> {
  const session = await requireSession();
  return { id: session.userId, email: session.email };
}

/** Service-role Supabase client scoped to the signed-in app session. */
export async function getAuthedDb() {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  return {
    supabase: createServiceClient(),
    userId: session.userId,
    email: session.email,
    user: { id: session.userId, email: session.email } satisfies AuthUser,
  };
}

export async function requireAuthedDb() {
  const session = await requireSession();
  return {
    supabase: createServiceClient(),
    userId: session.userId,
    email: session.email,
    user: { id: session.userId, email: session.email } satisfies AuthUser,
  };
}

export async function attachSessionCookie(
  response: NextResponse,
  userId: string,
  email: string
): Promise<NextResponse> {
  const token = await signSession(createSessionPayload(userId, email));
  response.cookies.set(APP_SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete(APP_SESSION_COOKIE);
  return response;
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ userId: string; email: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing Supabase env vars");
  }

  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  const body = (await res.json().catch(() => null)) as {
    user?: { id?: string; email?: string };
    error_description?: string;
    msg?: string;
    message?: string;
  } | null;

  if (!res.ok || !body?.user?.id) {
    throw new Error("Invalid email or password");
  }

  return {
    userId: body.user.id,
    email: (body.user.email ?? email).trim().toLowerCase(),
  };
}
