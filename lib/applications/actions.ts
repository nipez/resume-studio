"use server";

import type {
  AppInsight,
  AppPrep,
  Application,
  ApplicationEvent,
  ApplicationStatus,
  EventType,
  HiringContact,
  LogApplicationInput,
  ResumeSnapshot,
  StatusHistoryEntry,
  VersionLinkedApplication,
} from "@/lib/applications/types";
import { normalizeResumeSnapshot, parseJobFromVersionName } from "@/lib/applications/utils";
import {
  isMissingApplicationColumnError,
  isOptionalApplicationColumnError,
  stripApplicationColumn,
  stripOptionalApplicationColumns,
} from "@/lib/applications/db-write";
import { getResumeVersion } from "@/lib/resume/actions";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function mapEvent(row: Record<string, unknown>): ApplicationEvent {
  return {
    id: row.id as string,
    application_id: row.application_id as string,
    user_id: row.user_id as string,
    type: row.type as EventType,
    title: String(row.title ?? ""),
    date: row.date ? String(row.date) : null,
    time: String(row.time ?? ""),
    notes: String(row.notes ?? ""),
    done: Boolean(row.done),
    created_at: row.created_at as string,
  };
}

function mapApplication(
  row: Record<string, unknown>,
  events?: ApplicationEvent[]
): Application {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    role: String(row.role ?? ""),
    company: String(row.company ?? ""),
    job_desc: String(row.job_desc ?? ""),
    job_url: String(row.job_url ?? ""),
    applied_at: row.applied_at as string,
    resume_version_id: (row.resume_version_id as string | null) ?? null,
    resume_version_name: (row.resume_version_name as string | null) ?? null,
    resume_snapshot: normalizeResumeSnapshot(row.resume_snapshot),
    cover_letter: String(row.cover_letter ?? ""),
    answers: Array.isArray(row.answers)
      ? (row.answers as { q: string; a: string }[])
      : [],
    status: row.status as ApplicationStatus,
    status_history: Array.isArray(row.status_history)
      ? (row.status_history as StatusHistoryEntry[])
      : [],
    insight: (row.insight as AppInsight | null) ?? null,
    prep: (row.prep as AppPrep | null) ?? null,
    hiring_contacts: Array.isArray(row.hiring_contacts)
      ? (row.hiring_contacts as HiringContact[])
      : null,
    notes: String(row.notes ?? ""),
    created_at: row.created_at as string,
    events,
  };
}

async function insertApplicationRow(
  payload: Record<string, unknown>
): Promise<{ data: Record<string, unknown> | null; error: Error | null }> {
  const supabase = createClient();
  let { data, error } = await supabase
    .from("applications")
    .insert(payload)
    .select("*")
    .single();

  if (error && isOptionalApplicationColumnError(error.message)) {
    ({ data, error } = await supabase
      .from("applications")
      .insert(stripOptionalApplicationColumns(payload))
      .select("*")
      .single());
  }

  return {
    data: (data as Record<string, unknown> | null) ?? null,
    error: error ? new Error(error.message) : null,
  };
}

async function updateApplicationRow(
  id: string,
  payload: Record<string, unknown>
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  let { error } = await supabase.from("applications").update(payload).eq("id", id);

  if (error && isOptionalApplicationColumnError(error.message)) {
    ({ error } = await supabase
      .from("applications")
      .update(stripOptionalApplicationColumns(payload))
      .eq("id", id));
  }

  if (
    error &&
    payload.job_url !== undefined &&
    isMissingApplicationColumnError(error.message, "job_url")
  ) {
    ({ error } = await supabase
      .from("applications")
      .update(stripApplicationColumn(payload, "job_url"))
      .eq("id", id));
  }

  return { error: error ? new Error(error.message) : null };
}

export async function getApplicationsList(): Promise<{
  applications: Application[];
  versionCounts: Record<string, number>;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { applications: [], versionCounts: {} };
  }

  const [{ data: rows, error: appsError }, { data: events }] = await Promise.all([
    supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("applied_at", { ascending: false }),
    supabase
      .from("application_events")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true }),
  ]);

  if (appsError) {
    console.error("getApplicationsList:", appsError.message);
    return { applications: [], versionCounts: {} };
  }

  const eventsByApp = new Map<string, ApplicationEvent[]>();
  for (const row of events ?? []) {
    const ev = mapEvent(row);
    const list = eventsByApp.get(ev.application_id) ?? [];
    list.push(ev);
    eventsByApp.set(ev.application_id, list);
  }

  const applications = (rows ?? []).flatMap((row) => {
    try {
      return [mapApplication(row, eventsByApp.get(row.id as string) ?? [])];
    } catch (error) {
      console.error("mapApplication:", error);
      return [];
    }
  });

  const versionCounts: Record<string, number> = {};
  for (const app of applications) {
    if (app.resume_version_id) {
      versionCounts[app.resume_version_id] =
        (versionCounts[app.resume_version_id] ?? 0) + 1;
    }
  }

  return { applications, versionCounts };
}

export async function getApplicationCountsByVersion(): Promise<
  Record<string, number>
> {
  const { versionCounts } = await getApplicationsList();
  return versionCounts;
}

export async function getApplicationsForVersion(
  versionId: string
): Promise<VersionLinkedApplication[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: rows, error } = await supabase
    .from("applications")
    .select("id, role, company, applied_at")
    .eq("user_id", user.id)
    .eq("resume_version_id", versionId)
    .order("applied_at", { ascending: false });

  if (error) {
    console.error("getApplicationsForVersion:", error.message);
    return [];
  }

  return (rows ?? []).map((row) => ({
    id: row.id as string,
    role: String(row.role ?? ""),
    company: String(row.company ?? ""),
    applied_at: String(row.applied_at ?? ""),
  }));
}

export async function getApplication(id: string): Promise<Application | null> {
  const supabase = createClient();
  const { data: row, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) return null;

  const { data: events } = await supabase
    .from("application_events")
    .select("*")
    .eq("application_id", id)
    .order("date", { ascending: true });

  return mapApplication(row, (events ?? []).map(mapEvent));
}

export async function logApplication(input: LogApplicationInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const version = await getResumeVersion(input.versionId);
  if (!version) throw new Error("Resume version not found");

  const tf = version.tailored_for;
  const fromName = parseJobFromVersionName(version.name);
  const role = input.role?.trim() || tf?.role || fromName.role || "";
  const company = input.company?.trim() || tf?.company || fromName.company || "";
  const now = new Date().toISOString();
  const status: ApplicationStatus = "applied";

  const answers = (input.answers ?? []).filter(
    (a) => a.q?.trim() && a.a?.trim()
  );

  const insertPayload = {
    user_id: user.id,
    role,
    company,
    job_desc: input.jobDesc?.trim() ?? "",
    job_url: input.jobUrl?.trim() ?? "",
    applied_at: now,
    resume_version_id: version.id,
    resume_version_name: version.name,
    resume_snapshot: {
      name: version.name,
      template_style: version.template_style,
      data: version.data,
    },
    cover_letter: input.coverLetter?.trim() ?? "",
    answers,
    status,
    status_history: [{ status, at: now }],
  };

  const { data: created, error } = await insertApplicationRow(insertPayload);

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to log application");
  }

  revalidatePath("/applications");
  revalidatePath("/library");
  return mapApplication(created);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
) {
  const supabase = createClient();
  const app = await getApplication(id);
  if (!app) throw new Error("Application not found");

  const history = [...app.status_history];
  if (app.status !== status) {
    history.push({ status, at: new Date().toISOString() });
  }

  const { error } = await supabase
    .from("applications")
    .update({ status, status_history: history })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
}

export async function updateApplicationMeta(
  id: string,
  patch: {
    role?: string;
    company?: string;
    job_desc?: string;
    job_url?: string;
    notes?: string;
    applied_at?: string;
  }
) {
  const payload: Record<string, unknown> = {};
  if (patch.role !== undefined) payload.role = patch.role;
  if (patch.company !== undefined) payload.company = patch.company;
  if (patch.job_desc !== undefined) payload.job_desc = patch.job_desc;
  if (patch.job_url !== undefined) payload.job_url = patch.job_url;
  if (patch.notes !== undefined) payload.notes = patch.notes;
  if (patch.applied_at !== undefined) payload.applied_at = patch.applied_at;

  const { error } = await updateApplicationRow(id, payload);

  if (error) throw new Error(error.message);

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
}

export async function replaceApplicationResumeSnapshot(
  applicationId: string,
  input: { versionId: string } | { snapshot: ResumeSnapshot; resumeVersionName: string }
) {
  const supabase = createClient();
  const app = await getApplication(applicationId);
  if (!app) throw new Error("Application not found");

  let resumeVersionId: string | null = null;
  let resumeVersionName: string;
  let resumeSnapshot: ResumeSnapshot;

  if ("versionId" in input) {
    const version = await getResumeVersion(input.versionId);
    if (!version) throw new Error("Resume version not found");
    resumeVersionId = version.id;
    resumeVersionName = version.name;
    resumeSnapshot = {
      name: version.name,
      template_style: version.template_style,
      data: version.data,
    };
  } else {
    resumeVersionId = null;
    resumeVersionName = input.resumeVersionName;
    resumeSnapshot = input.snapshot;
  }

  const { error } = await supabase
    .from("applications")
    .update({
      resume_version_id: resumeVersionId,
      resume_version_name: resumeVersionName,
      resume_snapshot: resumeSnapshot,
    })
    .eq("id", applicationId);

  if (error) throw new Error(error.message);

  revalidatePath("/applications");
  revalidatePath(`/applications/${applicationId}`);
}

export async function updateApplicationHiringContacts(
  id: string,
  contacts: HiringContact[]
) {
  const { error } = await updateApplicationRow(id, { hiring_contacts: contacts });

  if (error) {
    if (isMissingApplicationColumnError(error.message, "hiring_contacts")) {
      return;
    }
    throw error;
  }
  revalidatePath(`/applications/${id}`);
}

export async function getCompanyApplicationHistory(
  company: string,
  excludeId?: string
): Promise<Pick<Application, "id" | "role" | "company" | "applied_at" | "status">[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !company.trim()) return [];

  const { data: rows } = await supabase
    .from("applications")
    .select("id, role, company, applied_at, status")
    .eq("user_id", user.id)
    .order("applied_at", { ascending: false });

  const key = company.trim().toLowerCase();
  return (rows ?? [])
    .filter((row) => {
      if (excludeId && row.id === excludeId) return false;
      return String(row.company ?? "").trim().toLowerCase() === key;
    })
    .map((row) => ({
      id: row.id as string,
      role: String(row.role ?? ""),
      company: String(row.company ?? ""),
      applied_at: row.applied_at as string,
      status: row.status as ApplicationStatus,
    }));
}

export async function updateApplicationInsight(id: string, insight: AppInsight) {
  const supabase = createClient();
  const { error } = await supabase
    .from("applications")
    .update({ insight })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/applications/${id}`);
}

export async function updateApplicationPrep(id: string, prep: AppPrep) {
  const supabase = createClient();
  const { error } = await supabase
    .from("applications")
    .update({ prep })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/applications/${id}`);
}

export async function deleteApplication(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/applications");
  revalidatePath("/library");
}

export async function addApplicationEvent(
  applicationId: string,
  type: EventType
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const labels: Record<EventType, string> = {
    interview: "Interview",
    followup: "Follow-up",
    note: "Reminder",
  };

  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("application_events")
    .insert({
      application_id: applicationId,
      user_id: user.id,
      type,
      title: labels[type],
      date,
      time: "",
      notes: "",
      done: false,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to add event");

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/applications");
  return mapEvent(data);
}

export async function updateApplicationEvent(
  eventId: string,
  applicationId: string,
  patch: {
    date?: string | null;
    time?: string;
    notes?: string;
    done?: boolean;
  }
) {
  const supabase = createClient();
  const payload: Record<string, unknown> = {};
  if (patch.date !== undefined) payload.date = patch.date || null;
  if (patch.time !== undefined) payload.time = patch.time;
  if (patch.notes !== undefined) payload.notes = patch.notes;
  if (patch.done !== undefined) payload.done = patch.done;

  const { error } = await supabase
    .from("application_events")
    .update(payload)
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/applications");
}

export async function deleteApplicationEvent(
  eventId: string,
  applicationId: string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("application_events")
    .delete()
    .eq("id", eventId);

  if (error) throw new Error(error.message);

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/applications");
}
