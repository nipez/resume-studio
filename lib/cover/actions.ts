"use server";

import type { CoverLetter, CoverLetterSaveResult } from "@/lib/cover/types";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

function friendlyDbError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("cover_letters") &&
    (lower.includes("does not exist") ||
      lower.includes("schema cache") ||
      lower.includes("could not find"))
  ) {
    return "Cover letter storage is not set up in the database yet. Apply the cover_letters migration in Supabase (see supabase/migrations/0005_cover_letters.sql).";
  }
  if (lower.includes("violates foreign key") && lower.includes("resume_version")) {
    return "That resume version is no longer available. Pick another base version and try again.";
  }
  return message || "Failed to save cover letter.";
}

export async function listCoverLetters(): Promise<CoverLetter[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("cover_letters")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map(mapRow);
}

export async function saveCoverLetter(input: {
  id?: string;
  title?: string;
  role?: string;
  company?: string;
  body: string;
  resumeVersionId?: string | null;
}): Promise<CoverLetterSaveResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated. Sign in and try again." };

  const role = input.role?.trim() ?? "";
  const company = input.company?.trim() ?? "";
  const title = (input.title?.trim() || deriveTitle(role, company)).slice(0, 200);
  const body = input.body.trim();
  if (!body) return { ok: false, error: "Write or generate a letter before saving." };

  let resumeVersionId = input.resumeVersionId ?? null;
  if (resumeVersionId) {
    const { data: version } = await supabase
      .from("resume_versions")
      .select("id")
      .eq("id", resumeVersionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!version) resumeVersionId = null;
  }

  const payload = {
    title,
    role,
    company,
    body,
    resume_version_id: resumeVersionId,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("cover_letters")
      .update(payload)
      .eq("id", input.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error || !data) {
      return { ok: false, error: friendlyDbError(error?.message ?? "") };
    }
    revalidatePath("/cover");
    return { ok: true, letter: mapRow(data) };
  }

  const { data, error } = await supabase
    .from("cover_letters")
    .insert({
      user_id: user.id,
      ...payload,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { ok: false, error: friendlyDbError(error?.message ?? "") };
  }
  revalidatePath("/cover");
  return { ok: true, letter: mapRow(data) };
}

export async function deleteCoverLetter(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("cover_letters")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: friendlyDbError(error.message) };
  revalidatePath("/cover");
  return { ok: true };
}
