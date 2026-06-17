import { createClient } from "@/lib/supabase/server";
import { resolveDisplayName } from "@/lib/profile/utils";

export async function getSessionProfile() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      displayName: null,
      avatarLetter: null,
      profileFullName: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, positioning")
    .eq("id", user.id)
    .single();

  const displayName = resolveDisplayName({
    profileFullName: profile?.full_name,
    metadataFullName: user.user_metadata?.full_name as string | undefined,
    email: user.email,
  });

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return { user, profile, displayName, avatarLetter, profileFullName: profile?.full_name ?? null };
}
