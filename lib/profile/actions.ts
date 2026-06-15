"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type StudentLevel = "high_school" | "college" | "other";

export type StudentSegment = {
  isStudent: boolean;
  studentLevel: StudentLevel | null;
};

export async function getStudentSegment(): Promise<StudentSegment> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isStudent: false, studentLevel: null };

  const { data } = await supabase
    .from("profiles")
    .select("is_student, student_level")
    .eq("id", user.id)
    .maybeSingle();

  return {
    isStudent: Boolean(data?.is_student),
    studentLevel: (data?.student_level as StudentLevel | null) ?? null,
  };
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

  const payload: Record<string, unknown> = { is_student: input.isStudent };
  if (input.studentLevel !== undefined) {
    payload.student_level = input.studentLevel;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/build");
}
