import { isAdminEmail } from "@/lib/auth/admin";
import {
  IMPERSONATOR_COOKIE,
  decodeImpersonator,
} from "@/lib/admin/impersonation";
import { establishSession } from "@/lib/admin/session";
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

  await establishSession(adminEmail);
  cookieStore.delete(IMPERSONATOR_COOKIE);
  revalidatePath("/", "layout");
  return adminEmail;
}
