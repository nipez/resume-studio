import { isAdminEmail, isAdminUser } from "@/lib/auth/admin";
import {
  APP_SESSION_COOKIE,
  createSessionPayload,
  sessionCookieOptions,
  signSession,
} from "@/lib/session";
import {
  IMPERSONATOR_COOKIE,
  encodeImpersonator,
} from "@/lib/admin/impersonation";
import { getAuthUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function resolveUserEmail(userId: string): Promise<string> {
  const svc = createServiceClient();
  const { data, error } = await svc.auth.admin.getUserById(userId);
  if (error || !data.user?.email) {
    throw new Error("User not found");
  }
  return data.user.email;
}

/** Switch the app session to `userId` while remembering the admin account. */
export async function startViewingAsUser(userId: string): Promise<void> {
  const admin = await getAuthUser();
  if (!isAdminUser(admin)) throw new Error("Not authorized");

  const email = await resolveUserEmail(userId);

  if (isAdminEmail(email)) {
    throw new Error("Cannot view as another admin account");
  }

  if (email.toLowerCase() === admin!.email?.toLowerCase()) {
    throw new Error("You are already signed in as this account");
  }

  const cookieStore = cookies();
  cookieStore.set(
    IMPERSONATOR_COOKIE,
    encodeImpersonator(admin!.email!),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    }
  );
  cookieStore.set(
    APP_SESSION_COOKIE,
    signSession(createSessionPayload(userId, email)),
    sessionCookieOptions()
  );

  revalidatePath("/", "layout");
}
