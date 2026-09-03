"use server";

import { isAdminUser } from "@/lib/auth/admin";
import {
  formatBannedPhrasesInput,
  getSystemGuidelines,
  invalidateSystemGuidelinesCache,
  parseBannedPhrasesInput,
  type SystemGuidelines,
} from "@/lib/ai/system-guidelines";
import { getAuthUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const user = await getAuthUser();
  if (!isAdminUser(user)) throw new Error("Not authorized");
  return user!;
}

export async function getAdminSystemGuidelines(): Promise<SystemGuidelines> {
  await requireAdmin();
  return getSystemGuidelines();
}

export async function updateSystemGuidelines(input: {
  guidelines: string;
  bannedPhrasesText: string;
}): Promise<SystemGuidelines> {
  const admin = await requireAdmin();
  const bannedPhrases = parseBannedPhrasesInput(input.bannedPhrasesText);

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("ai_system_guidelines")
    .upsert(
      {
        id: "default",
        guidelines: input.guidelines.trim(),
        banned_phrases: bannedPhrases,
        updated_by: admin.id,
      },
      { onConflict: "id" }
    )
    .select("guidelines, banned_phrases, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save guidelines");
  }

  invalidateSystemGuidelinesCache();
  revalidatePath("/admin");

  return {
    guidelines: data.guidelines ?? "",
    bannedPhrases: Array.isArray(data.banned_phrases)
      ? data.banned_phrases.filter(Boolean).map(String)
      : [],
    updatedAt: data.updated_at ?? null,
  };
}

export { formatBannedPhrasesInput };
