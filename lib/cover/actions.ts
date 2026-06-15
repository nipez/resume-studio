"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CoverLetter = {
  id: string;
  title: string;
  role: string;
  company: string;
  body: string;
  resume_version_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: Record<string, unknown>): CoverLetter {
  return {
    id: row.id as string,
    title: (row.title as string) ?? "Cover letter",
    role: (row.role as string) ?? "",
    company: (row.company as string) ?? "",
    body: (row.body as string) ?? "",
    resume_version_id: (row.resume_version_id as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function deriveTitle(role: string, company: string) {
  const r = role.trim();
  const c = company.trim();
  if (r && c) return `${r} · ${c}`;
  if (r) return r;
  if (c) return c;
  return "Cover letter";
}

export async function listCoverLetters(): Promise<CoverLetter[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("cover_letters")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (data ?? []).map(mapRow);
}

export async function saveCoverLetter(input: {
  id?: string;
  title?: string;
  role?: string;
  company?: string;
  body: string;
  resumeVersionId?: string | null;
}): Promise<CoverLetter> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const role = input.role?.trim() ?? "";
  const company = input.company?.trim() ?? "";
  const title = (input.title?.trim() || deriveTitle(role, company)).slice(0, 200);

  // Update an existing letter when an id is supplied, otherwise insert a new one.
  if (input.id) {
    const { data, error } = await supabase
      .from("cover_letters")
      .update({
        title,
        role,
        company,
        body: input.body,
        resume_version_id: input.resumeVersionId ?? null,
      })
      .eq("id", input.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error || !data) throw new Error(error?.message ?? "Failed to save");
    revalidatePath("/cover");
    return mapRow(data);
  }

  const { data, error } = await supabase
    .from("cover_letters")
    .insert({
      user_id: user.id,
      title,
      role,
      company,
      body: input.body,
      resume_version_id: input.resumeVersionId ?? null,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to save");
  revalidatePath("/cover");
  return mapRow(data);
}

export async function deleteCoverLetter(id: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("cover_letters")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/cover");
}
