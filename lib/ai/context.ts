import type { PlanTier } from "@/lib/ai/config";
import type { AIAction } from "@/lib/ai/config";

type AuthContext = {
  user: { id: string; email?: string | null };
  planTier: PlanTier;
};

export function aiCallOptions(auth: AuthContext, action: AIAction) {
  return {
    userId: auth.user.id,
    userEmail: auth.user.email ?? null,
    planTier: auth.planTier,
    action,
  };
}
