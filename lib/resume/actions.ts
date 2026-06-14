"use server";

import { createEmptyResumeData, normalizeResumeData } from "@/lib/resume/defaults";
import type { ResumeVersion } from "@/lib/resume/db-types";
import type { ResumeData, TemplateStyle } from "@/lib/types/resume";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function mapRow(row: Record<string, unknown>): ResumeVersion {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    template_style: row.template_style as TemplateStyle,
    tailored_for: (row.tailored_for as ResumeVersion["tailored_for"]) ?? null,
    data: normalizeResumeData(row.data),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function getLibraryData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { versions: [], defaultVersionId: null as string | null };
  }

  const [{ data: profile }, { data: versions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("default_version_id")
      .eq("id", user.id)
      .single(),
    supabase
      .from("resume_versions")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  return {
    versions: (versions ?? []).map(mapRow),
    defaultVersionId: profile?.default_version_id ?? null,
    userEmail: user.email ?? "",
    userName:
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "",
  };
}

export async function getResumeVersion(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("resume_versions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapRow(data);
}

export async function createResumeVersion(copyFromId?: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_version_id")
    .eq("id", user.id)
    .single();

  const sourceId = copyFromId ?? profile?.default_version_id ?? undefined;

  let name = "Untitled Resume";
  let template_style: TemplateStyle = "twocol";
  let data = createEmptyResumeData(
    (user.user_metadata?.full_name as string) ?? "",
    user.email ?? ""
  );
  let tailored_for = null;

  if (sourceId) {
    const source = await getResumeVersion(sourceId);
    if (source) {
      if (copyFromId) {
        name = `${source.name} (copy)`;
      } else {
        name = "Untitled Resume";
      }
      template_style = source.template_style;
      data = structuredClone(source.data);
      tailored_for = null;
    }
  }

  const { data: created, error } = await supabase
    .from("resume_versions")
    .insert({
      user_id: user.id,
      name,
      template_style,
      tailored_for,
      data,
    })
    .select("*")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Failed to create");

  const { count } = await supabase
    .from("resume_versions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count === 1) {
    await supabase
      .from("profiles")
      .update({ default_version_id: created.id })
      .eq("id", user.id);
  }

  revalidatePath("/library");
  return mapRow(created);
}

export async function updateResumeVersion(
  id: string,
  patch: {
    name?: string;
    template_style?: TemplateStyle;
    data?: ResumeData;
  }
) {
  const supabase = createClient();
  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.template_style !== undefined)
    payload.template_style = patch.template_style;
  if (patch.data !== undefined) payload.data = patch.data;

  const { data, error } = await supabase
    .from("resume_versions")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update");

  revalidatePath("/library");
  revalidatePath(`/editor/${id}`);
  return mapRow(data);
}

export async function deleteResumeVersion(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: versions } = await supabase
    .from("resume_versions")
    .select("id")
    .eq("user_id", user.id);

  if ((versions?.length ?? 0) <= 1) {
    throw new Error("You need at least one resume version");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_version_id")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("resume_versions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (profile?.default_version_id === id) {
    const remaining = versions?.find((v) => v.id !== id);
    if (remaining) {
      await supabase
        .from("profiles")
        .update({ default_version_id: remaining.id })
        .eq("id", user.id);
    }
  }

  revalidatePath("/library");
}

export async function setDefaultResumeVersion(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ default_version_id: id })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/library");
}
