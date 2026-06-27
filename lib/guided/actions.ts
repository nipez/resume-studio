"use server";

import { normalizeResumeData } from "@/lib/resume/defaults";
import type { ResumeData, TemplateStyle } from "@/lib/types/resume";
import { getAuthedDb } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type GuidedDraft = {
  step: number;
  templateStyle: TemplateStyle;
  makeDefault: boolean;
  data: ResumeData;
  contextNotes: string;
};

export async function getGuidedDraft(): Promise<GuidedDraft | null> {
  const { supabase, userId } = await getAuthedDb();

  const { data, error } = await supabase
    .from("guided_drafts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    step: typeof data.step === "number" ? data.step : 0,
    templateStyle: (data.template_style as TemplateStyle) ?? "twocol",
    makeDefault: data.make_default ?? true,
    data: normalizeResumeData(data.data),
    contextNotes: (data.context_notes as string) ?? "",
  };
}

export async function saveGuidedDraft(draft: GuidedDraft) {
  const { supabase, userId } = await getAuthedDb();

  const { error } = await supabase.from("guided_drafts").upsert(
    {
      user_id: userId,
      step: draft.step,
      template_style: draft.templateStyle,
      make_default: draft.makeDefault,
      data: normalizeResumeData(draft.data),
      context_notes: draft.contextNotes ?? "",
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
}

export async function discardGuidedDraft() {
  const { supabase, userId } = await getAuthedDb();

  await supabase.from("guided_drafts").delete().eq("user_id", userId);
  revalidatePath("/library");
}

export async function finishGuidedDraft(input: {
  name: string;
  templateStyle: TemplateStyle;
  makeDefault: boolean;
  data: ResumeData;
}): Promise<{ id: string }> {
  const { supabase, userId } = await getAuthedDb();

  const { data: created, error } = await supabase
    .from("resume_versions")
    .insert({
      user_id: userId,
      name: input.name.trim() || "My Resume",
      template_style: input.templateStyle,
      tailored_for: null,
      data: normalizeResumeData(input.data),
    })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to create resume");
  }

  const { count } = await supabase
    .from("resume_versions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (input.makeDefault || count === 1) {
    await supabase
      .from("profiles")
      .update({ default_version_id: created.id })
      .eq("id", userId);
  }

  await supabase.from("guided_drafts").delete().eq("user_id", userId);

  revalidatePath("/library");
  return { id: created.id as string };
}
