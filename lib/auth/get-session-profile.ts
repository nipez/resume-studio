import { getAuthUser } from "@/lib/auth";
import { resolveIsStudent } from "@/lib/profile/persona";
import { resolveDisplayName } from "@/lib/profile/utils";
import { createServiceClient } from "@/lib/supabase/server";

export async function getSessionProfile() {
  const user = await getAuthUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      displayName: null,
      avatarLetter: null,
      profileFullName: null,
      isStudent: false,
      hasResume: false,
    };
  }

  const supabase = createServiceClient();

  const [{ data: profile }, { count: resumeCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, positioning, persona, is_student")
      .eq("id", user.id)
      .single(),
    supabase
      .from("resume_versions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("archived_at", null),
  ]);

  const displayName = resolveDisplayName({
    profileFullName: profile?.full_name,
    metadataFullName: undefined,
    email: user.email,
  });

  const avatarLetter = displayName.charAt(0).toUpperCase();
  const isStudent = resolveIsStudent({
    persona: profile?.persona,
    isStudent: profile?.is_student,
  });

  return {
    user,
    profile,
    displayName,
    avatarLetter,
    profileFullName: profile?.full_name ?? null,
    isStudent,
    hasResume: (resumeCount ?? 0) > 0,
  };
}
