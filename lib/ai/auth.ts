import { createClient } from "@/lib/supabase/server";

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

  const userName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Candidate";

  return {
    user,
    profile,
    userName,
    positioning: profile?.positioning ?? "",
  };
}
