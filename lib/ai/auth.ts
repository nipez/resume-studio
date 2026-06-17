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
    .select("full_name, positioning")
    .eq("id", user.id)
    .single();

  const userName = resolveDisplayName({
    profileFullName: profile?.full_name,
    metadataFullName: user.user_metadata?.full_name as string | undefined,
    email: user.email,
  });

  return {
    user,
    profile,
    userName,
    positioning: profile?.positioning ?? "",
  };
}
