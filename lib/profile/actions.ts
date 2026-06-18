"use server";

import {
  type FirstRunPath,
  type UserPersona,
  resolveIsStudent,
} from "@/lib/profile/persona";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type StudentLevel = "high_school" | "college" | "other";

export type UserProfileContext = {
  persona: UserPersona | null;
  onboardingPersonaSet: boolean;
  isStudent: boolean;
  studentLevel: StudentLevel | null;
};

/** @deprecated Use getUserProfileContext */
export type StudentSegment = {
  isStudent: boolean;
  studentLevel: StudentLevel | null;
};

async function loadProfileRow(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("persona, onboarding_persona_set, is_student, student_level")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getUserProfileContext(): Promise<UserProfileContext> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      persona: null,
      onboardingPersonaSet: false,
      isStudent: false,
      studentLevel: null,
    };
  }

  const data = await loadProfileRow(user.id);
  const persona = (data?.persona as UserPersona | null) ?? null;

  return {
    persona,
    onboardingPersonaSet: Boolean(data?.onboarding_persona_set),
    isStudent: resolveIsStudent({
      persona,
      isStudent: data?.is_student,
    }),
    studentLevel: (data?.student_level as StudentLevel | null) ?? null,
  };
}

export async function getStudentSegment(): Promise<StudentSegment> {
  const ctx = await getUserProfileContext();
  return {
    isStudent: ctx.isStudent,
    studentLevel: ctx.studentLevel,
  };
}

export async function setFirstRunPersona(path: FirstRunPath): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const persona: UserPersona = path === "student" ? "student" : "professional";
  const payload: Record<string, unknown> = {
    persona,
    onboarding_persona_set: true,
    is_student: path === "student",
  };

  if (path === "student") {
    payload.plan_tier = "student";
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/build");
  revalidatePath("/library");
}

export async function setStudentSegment(input: {
  isStudent: boolean;
  studentLevel?: StudentLevel | null;
}): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload: Record<string, unknown> = {
    is_student: input.isStudent,
    persona: input.isStudent ? "student" : "professional",
    onboarding_persona_set: true,
  };

  if (input.studentLevel !== undefined) {
    payload.student_level = input.studentLevel;
  }

  if (input.isStudent) {
    payload.plan_tier = "student";
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/build");
  revalidatePath("/dashboard");
}

export async function updateProfileFullName(fullName: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = fullName.trim();
  if (!trimmed) {
    throw new Error("Enter a name to display.");
  }
  if (trimmed.length > 80) {
    throw new Error("Name is too long.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: trimmed })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
