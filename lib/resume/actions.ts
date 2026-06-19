"use server";

import { createEmptyResumeData, normalizeResumeData } from "@/lib/resume/defaults";
import type { ResumeVersion } from "@/lib/resume/db-types";
import type { ResumeData, TemplateStyle } from "@/lib/types/resume";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { resolveDisplayName } from "@/lib/profile/utils";

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
    archived_at: row.archived_at ? String(row.archived_at) : null,
  };
}

function isActiveVersion(version: Pick<ResumeVersion, "archived_at">) {
  return !version.archived_at;
}

export async function getLibraryData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      versions: [],
      archivedVersions: [],
      defaultVersionId: null as string | null,
      userEmail: "",
      userName: "",
    };
  }

  const [{ data: profile }, { data: versions }] = await Promise.all([
    supabase
      .from("profiles")
      .select("default_version_id, full_name")
      .eq("id", user.id)
      .single(),
    supabase
      .from("resume_versions")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  const allVersions = (versions ?? []).map(mapRow);
  const activeVersions = allVersions.filter(isActiveVersion);
  const archivedVersions = allVersions.filter((v) => !isActiveVersion(v));

  let defaultVersionId = profile?.default_version_id ?? null;
  if (
    defaultVersionId &&
    !activeVersions.some((version) => version.id === defaultVersionId)
  ) {
    defaultVersionId = activeVersions[0]?.id ?? null;
  }

  return {
    versions: activeVersions,
    archivedVersions,
    defaultVersionId,
    userEmail: user.email ?? "",
    userName: resolveDisplayName({
      profileFullName: profile?.full_name,
      metadataFullName: user.user_metadata?.full_name as string | undefined,
      email: user.email,
    }),
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
    .select("default_version_id, full_name")
    .eq("id", user.id)
    .single();

  const sourceId = copyFromId ?? profile?.default_version_id ?? undefined;

  const userName = resolveDisplayName({
    profileFullName: profile?.full_name,
    metadataFullName: user.user_metadata?.full_name as string | undefined,
    email: user.email,
  });

  let name = "Untitled Resume";
  let template_style: TemplateStyle = "twocol";
  let data = createEmptyResumeData(userName, user.email ?? "");
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

  const { data: rows } = await supabase
    .from("resume_versions")
    .select("id, archived_at")
    .eq("user_id", user.id);

  const versions = (rows ?? []).map((row) => ({
    id: row.id as string,
    archived_at: row.archived_at ? String(row.archived_at) : null,
  }));
  const target = versions.find((v) => v.id === id);
  if (!target) throw new Error("Resume version not found");

  const activeVersions = versions.filter(isActiveVersion);
  if (isActiveVersion(target) && activeVersions.length <= 1) {
    throw new Error("You need at least one active resume version");
  }
  if (versions.length <= 1) {
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
    const remaining = activeVersions.find((v) => v.id !== id);
    if (remaining) {
      await supabase
        .from("profiles")
        .update({ default_version_id: remaining.id })
        .eq("id", user.id);
    }
  }

  revalidatePath("/library");
}

export async function archiveResumeVersion(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: rows } = await supabase
    .from("resume_versions")
    .select("id, archived_at")
    .eq("user_id", user.id);

  const versions = (rows ?? []).map((row) => ({
    id: row.id as string,
    archived_at: row.archived_at ? String(row.archived_at) : null,
  }));
  const target = versions.find((v) => v.id === id);
  if (!target) throw new Error("Resume version not found");
  if (!isActiveVersion(target)) return;

  const activeVersions = versions.filter(isActiveVersion);
  if (activeVersions.length <= 1) {
    throw new Error("You need at least one active resume version");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_version_id")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("resume_versions")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  if (profile?.default_version_id === id) {
    const nextDefault = activeVersions.find((v) => v.id !== id);
    if (nextDefault) {
      await supabase
        .from("profiles")
        .update({ default_version_id: nextDefault.id })
        .eq("id", user.id);
    }
  }

  revalidatePath("/library");
  revalidatePath("/tailor");
  revalidatePath("/cover");
}

export async function restoreResumeVersion(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("resume_versions")
    .update({ archived_at: null })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/library");
  revalidatePath("/tailor");
  revalidatePath("/cover");
}

export async function setDefaultResumeVersion(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const version = await getResumeVersion(id);
  if (!version) throw new Error("Resume version not found");
  if (version.archived_at) {
    throw new Error("Restore this resume before setting it as default");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ default_version_id: id })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/library");
}

export async function importResumeVersion(data: ResumeData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: created, error } = await supabase
    .from("resume_versions")
    .insert({
      user_id: user.id,
      name: "Master Resume",
      template_style: "twocol" as TemplateStyle,
      tailored_for: null,
      data: normalizeResumeData(data),
    })
    .select("*")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Failed to import");

  await supabase
    .from("profiles")
    .update({ default_version_id: created.id })
    .eq("id", user.id);

  revalidatePath("/library");
  return mapRow(created);
}

export async function backfillTailoredJobContext(
  versionId: string,
  patch: { jobDesc?: string; jobUrl?: string; contextNotes?: string }
): Promise<void> {
  const version = await getResumeVersion(versionId);
  if (!version?.tailored_for || version.tailored_for.jobDesc?.trim()) return;
  if (!patch.jobDesc?.trim()) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const next = {
    ...version.tailored_for,
    jobDesc: patch.jobDesc.trim(),
    jobUrl: patch.jobUrl?.trim() ?? version.tailored_for.jobUrl ?? "",
    contextNotes:
      patch.contextNotes?.trim() ?? version.tailored_for.contextNotes ?? "",
  };

  await supabase
    .from("resume_versions")
    .update({ tailored_for: next })
    .eq("id", versionId)
    .eq("user_id", user.id);

  revalidatePath("/cover");
  revalidatePath("/library");
}

export async function saveTailoredVersion(input: {
  baseId: string;
  jobRole: string;
  jobCompany: string;
  jobDesc?: string;
  jobUrl?: string;
  contextNotes?: string;
  depth: "light" | "deep";
  data: ResumeData;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const base = await getResumeVersion(input.baseId);
  if (!base) throw new Error("Base version not found");

  const name =
    (input.jobRole ? input.jobRole : "Tailored") +
    (input.jobCompany ? " · " + input.jobCompany : "");

  const { data: created, error } = await supabase
    .from("resume_versions")
    .insert({
      user_id: user.id,
      name,
      template_style: base.template_style,
      tailored_for: {
        role: input.jobRole,
        company: input.jobCompany,
        depth: input.depth,
        jobDesc: input.jobDesc?.trim() ?? "",
        jobUrl: input.jobUrl?.trim() ?? "",
        contextNotes: input.contextNotes?.trim() ?? "",
      },
      data: normalizeResumeData(input.data),
    })
    .select("*")
    .single();

  if (error || !created) throw new Error(error?.message ?? "Failed to save");

  const tailoredFor = {
    role: input.jobRole,
    company: input.jobCompany,
    depth: input.depth,
    jobDesc: input.jobDesc?.trim() ?? "",
    jobUrl: input.jobUrl?.trim() ?? "",
    contextNotes: input.contextNotes?.trim() ?? "",
  };

  await supabase.from("workspace_drafts").upsert(
    {
      user_id: user.id,
      job_role: input.jobRole,
      job_company: input.jobCompany,
      job_desc: input.jobDesc?.trim() ?? "",
      job_url: input.jobUrl?.trim() ?? "",
      context_notes: input.contextNotes?.trim() ?? "",
    },
    { onConflict: "user_id" }
  );

  if (input.jobCompany.trim()) {
    await supabase
      .from("saved_jobs")
      .update({
        tailored_version_id: created.id,
        job_desc: input.jobDesc?.trim() ?? "",
        job_url: input.jobUrl?.trim() ?? "",
        context_notes: input.contextNotes?.trim() ?? "",
      })
      .eq("user_id", user.id)
      .ilike("company", input.jobCompany.trim());
  }

  revalidatePath("/library");
  revalidatePath("/tailor");
  revalidatePath("/cover");
  return mapRow({ ...created, tailored_for: tailoredFor });
}
