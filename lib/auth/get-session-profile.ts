import { createClient } from "@/lib/supabase/server";

export async function getSessionProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, displayName: null, avatarLetter: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, positioning")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "there";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return { user, profile, displayName, avatarLetter };
}
