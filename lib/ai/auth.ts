import { resolveEffectivePlanTier, type PlanTier } from "@/lib/ai/config";
import { getAuthedDb } from "@/lib/auth";
import { resolveDisplayName } from "@/lib/profile/utils";

export async function requireAIUser() {
  let authed;
  try {
    authed = await getAuthedDb();
  } catch {
    return { error: "Unauthorized" as const, status: 401 };
  }

  const { supabase, userId, user } = authed;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, positioning, plan_tier, is_student, persona")
    .eq("id", userId)
    .single();

  const userName = resolveDisplayName({
    profileFullName: profile?.full_name,
    metadataFullName: undefined,
    email: user.email,
  });

  const planTier: PlanTier = resolveEffectivePlanTier({
    planTier: profile?.plan_tier,
    persona: profile?.persona,
    isStudent: profile?.is_student,
  });

  return {
    user,
    profile,
    userName,
    positioning: profile?.positioning ?? "",
    planTier,
  };
}
