import { isAdminEmail } from "@/lib/auth/admin";
import {
  APP_SESSION_COOKIE,
  createSessionPayload,
  sessionCookieOptions,
  signSession,
} from "@/lib/session";
import {
  IMPERSONATOR_COOKIE,
  decodeImpersonator,
} from "@/lib/admin/impersonation";
import { findUserIdByEmail } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export function getStoredImpersonatorEmail(): string | null {
  const cookieStore = cookies();
  return decodeImpersonator(cookieStore.get(IMPERSONATOR_COOKIE)?.value);
}

/** Restore the admin session saved when view-as started. */
export async function restoreAdminFromImpersonation(): Promise<string> {
  const cookieStore = cookies();
  const adminEmail = decodeImpersonator(
    cookieStore.get(IMPERSONATOR_COOKIE)?.value
  );
  if (!adminEmail || !isAdminEmail(adminEmail)) {
    cookieStore.delete(IMPERSONATOR_COOKIE);
    throw new Error("No valid admin session to return to");
  }

  const adminUserId = await findUserIdByEmail(adminEmail);
  if (!adminUserId) {
    cookieStore.delete(IMPERSONATOR_COOKIE);
    throw new Error("Admin account not found");
  }

  cookieStore.set(
    APP_SESSION_COOKIE,
    signSession(createSessionPayload(adminUserId, adminEmail)),
    sessionCookieOptions()
  );
  cookieStore.delete(IMPERSONATOR_COOKIE);
  revalidatePath("/", "layout");
  return adminEmail;
}
