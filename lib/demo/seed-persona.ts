import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEMO_APPLICATIONS,
  DEMO_COVER_LETTERS,
  DEMO_PERSONA,
  DEMO_RESUMES,
  DEMO_WORKSPACE,
} from "@/lib/demo/persona-data";

export type SeedDemoPersonaOptions = {
  /** Override display name (defaults to Alex Rivera). */
  fullName?: string;
  /** Replace existing demo data for this user before seeding. */
  replace?: boolean;
};

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function daysFromNowDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function clearDemoData(svc: SupabaseClient, userId: string) {
  await svc.from("profiles").update({ default_version_id: null }).eq("id", userId);
  await svc.from("applications").delete().eq("user_id", userId);
  await svc.from("cover_letters").delete().eq("user_id", userId);
  await svc.from("resume_versions").delete().eq("user_id", userId);
  await svc.from("workspace_drafts").delete().eq("user_id", userId);
  await svc.from("guided_drafts").delete().eq("user_id", userId);
}

/**
 * Populate a demo auth user with resumes, cover letters, applications (with
 * insights, prep, events), and an in-progress workspace draft.
 */
export async function seedDemoPersona(
  svc: SupabaseClient,
  userId: string,
  options: SeedDemoPersonaOptions = {}
): Promise<void> {
  const fullName = options.fullName?.trim() || DEMO_PERSONA.fullName;

  if (options.replace) {
    await clearDemoData(svc, userId);
  }

  const resumeIdByKey = new Map<string, string>();

  for (const resume of DEMO_RESUMES) {
    const data = { ...resume.data, name: fullName };

    const { data: row, error } = await svc
      .from("resume_versions")
      .insert({
        user_id: userId,
        name: resume.name,
        template_style: resume.templateStyle,
        tailored_for: resume.tailoredFor ?? null,
        data,
      })
      .select("id")
      .single();

    if (error || !row) {
      throw new Error(error?.message ?? `Failed to seed resume "${resume.key}"`);
    }
    resumeIdByKey.set(resume.key, row.id);
  }

  const masterId = resumeIdByKey.get("master");
  if (!masterId) throw new Error("Master resume missing from seed data");

  const { error: profileErr } = await svc
    .from("profiles")
    .update({
      full_name: fullName,
      positioning: DEMO_PERSONA.positioning,
      default_version_id: masterId,
      is_student: false,
      student_level: null,
    })
    .eq("id", userId);

  if (profileErr) throw new Error(profileErr.message);

  for (const letter of DEMO_COVER_LETTERS) {
    const resumeVersionId = resumeIdByKey.get(letter.resumeKey) ?? null;
    const { error } = await svc.from("cover_letters").insert({
      user_id: userId,
      title: letter.title,
      role: letter.role,
      company: letter.company,
      body: letter.body.replace(/Alex Rivera/g, fullName),
      resume_version_id: resumeVersionId,
    });
    if (error) throw new Error(error.message);
  }

  for (const app of DEMO_APPLICATIONS) {
    const resumeId = resumeIdByKey.get(app.resumeKey);
    if (!resumeId) {
      throw new Error(`Resume key "${app.resumeKey}" not found for application "${app.key}"`);
    }

    const resumeSeed = DEMO_RESUMES.find((r) => r.key === app.resumeKey)!;
    const resumeData = { ...resumeSeed.data, name: fullName };

    const { data: appRow, error: appErr } = await svc
      .from("applications")
      .insert({
        user_id: userId,
        role: app.role,
        company: app.company,
        job_desc: app.jobDesc,
        job_url: app.jobUrl,
        applied_at: daysAgoIso(app.daysAgo),
        resume_version_id: resumeId,
        resume_version_name: resumeSeed.name,
        resume_snapshot: {
          name: resumeSeed.name,
          template_style: resumeSeed.templateStyle,
          data: resumeData,
        },
        cover_letter: app.coverLetter.replace(/Alex Rivera/g, fullName),
        answers: app.answers,
        status: app.status,
        status_history: app.statusHistory,
        insight: app.insight,
        prep: app.prep,
        hiring_contacts: app.hiringContacts,
        notes: app.notes,
      })
      .select("id")
      .single();

    if (appErr || !appRow) {
      throw new Error(appErr?.message ?? `Failed to seed application "${app.key}"`);
    }

    if (app.events.length > 0) {
      const { error: evErr } = await svc.from("application_events").insert(
        app.events.map((ev) => ({
          application_id: appRow.id,
          user_id: userId,
          type: ev.type,
          title: ev.title,
          date: daysFromNowDate(ev.daysFromNow),
          time: ev.time,
          notes: ev.notes,
          done: ev.done,
        }))
      );
      if (evErr) throw new Error(evErr.message);
    }
  }

  const { error: wsErr } = await svc.from("workspace_drafts").upsert({
    user_id: userId,
    job_role: DEMO_WORKSPACE.jobRole,
    job_company: DEMO_WORKSPACE.jobCompany,
    job_desc: DEMO_WORKSPACE.jobDesc,
    job_url: DEMO_WORKSPACE.jobUrl,
    cover_text: DEMO_WORKSPACE.coverText.replace(/Alex Rivera/g, fullName),
    cover_hm: DEMO_WORKSPACE.coverHm,
    qa: DEMO_WORKSPACE.qa,
  });

  if (wsErr) throw new Error(wsErr.message);
}
