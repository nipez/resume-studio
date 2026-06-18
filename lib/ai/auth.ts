import { resolveEffectivePlanTier, type PlanTier } from "@/lib/ai/config";
import { createClient } from "@/lib/supabase/server";
import { resolveDisplayName } from "@/lib/profile/utils";

export async function requireAIUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" as const, status: 401 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, positioning, plan_tier, is_student, persona")
    .eq("id", user.id)
    .single();

  const userName = resolveDisplayName({
    profileFullName: profile?.full_name,
    metadataFullName: user.user_metadata?.full_name as string | undefined,
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
