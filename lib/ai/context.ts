import type { PlanTier } from "@/lib/ai/config";
import type { AIAction } from "@/lib/ai/config";

type AuthContext = {
  user: { id: string };
  planTier: PlanTier;
};

export function aiCallOptions(auth: AuthContext, action: AIAction) {
  return {
    userId: auth.user.id,
    planTier: auth.planTier,
    action,
  };
}
