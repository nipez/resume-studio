"use client";

import { CoverLetterControls } from "@/components/applications/cover-letter-controls";
import { ReplaceResumeControls } from "@/components/applications/replace-resume-controls";
import { ResumePreviewModal } from "@/components/applications/resume-preview-modal";
import type { Application, ApplicationStatus, HiringContact } from "@/lib/applications/types";
import {
  addApplicationEvent,
  deleteApplication,
  deleteApplicationEvent,
  updateApplicationCoverLetter,
  updateApplicationEvent,
  updateApplicationHiringContacts,
  updateApplicationInsight,
  updateApplicationMeta,
  updateApplicationPrep,
  updateApplicationStatus,
} from "@/lib/applications/actions";
import {
  APPLICATION_STATUSES,
  appEventLabel,
  appStatusMeta,
  applicationDetailTitle,
  appliedDateFromInput,
  appliedDateInputValue,
  eventDotColor,
  fitScoreStyle,
  formatAppDate,
  todayISO,
} from "@/lib/applications/utils";
import { mockBannerClass } from "@/components/shared/job-fields";
import { Spinner } from "@/components/ui/spinner";
import type { CoverLetter } from "@/lib/cover/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { templateLabel } from "@/lib/resume/build-resume-html";
import {
  buildCoverHTML,
  openPrintHtml,
} from "@/lib/resume/build-cover-html";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type ApplicationDetailViewProps = {
  application: Application;
  resumeVersions: ResumeVersion[];
  savedCoverLetters: CoverLetter[];
  companyHistory: Pick<
    Application,
    "id" | "role" | "company" | "applied_at" | "status"
  >[];
};

export function ApplicationDetailView({
  application: initial,
  resumeVersions,
  savedCoverLetters,
  companyHistory,
}: ApplicationDetailViewProps) {
  const router = useRouter();
  const [app, setApp] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [insightBusy, setInsightBusy] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [prepBusy, setPrepBusy] = useState(false);
  const [prepError, setPrepError] = useState("");
  const [contactsBusy, setContactsBusy] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  const statusMeta = appStatusMeta(app.status);
  const title = applicationDetailTitle(app);

  const snapHtml = useMemo(
    () =>
      buildResumeHTML(
        {
          templateStyle: app.resume_snapshot.template_style,
          data: app.resume_snapshot.data,
        },
        false
      ),
    [app.resume_snapshot]
  );

  const sortedEvents = useMemo(
    () =>
      [...(app.events ?? [])].sort((a, b) =>
        String(a.date ?? "").localeCompare(String(b.date ?? ""))
      ),
    [app.events]
  );

  function patchLocal(patch: Partial<Application>) {
    setApp((prev) => ({ ...prev, ...patch }));
  }

  function saveMeta(patch: Parameters<typeof updateApplicationMeta>[1]) {
    patchLocal(patch);
    startTransition(async () => {
      await updateApplicationMeta(app.id, patch);
      router.refresh();
    });
  }

  function setStatus(status: ApplicationStatus) {
    patchLocal({ status });
    startTransition(async () => {
      await updateApplicationStatus(app.id, status);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Delete this application and its snapshot? This cannot be undone."))
      return;
    startTransition(async () => {
      await deleteApplication(app.id);
      router.push("/applications");
    });
  }

  async function handleAnalyze() {
    setInsightBusy(true);
    setInsightError("");
    try {
      const res = await fetch("/api/ai/app-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: app.role,
          jobCompany: app.company,
          jobDesc: app.job_desc,
          summary: app.resume_snapshot.data.summary,
          skills: app.resume_snapshot.data.skills,
          coverLetter: app.cover_letter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setMockMode(Boolean(data.mock));
      patchLocal({ insight: data.insight });
      await updateApplicationInsight(app.id, data.insight);
      router.refresh();
    } catch (e) {
      setInsightError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setInsightBusy(false);
    }
  }

  async function handleGenPrep() {
    setPrepBusy(true);
    setPrepError("");
    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: app.role,
          jobCompany: app.company,
          jobDesc: app.job_desc,
          summary: app.resume_snapshot.data.summary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Prep generation failed");
      setMockMode(Boolean(data.mock));
      patchLocal({ prep: data.prep });
      await updateApplicationPrep(app.id, data.prep);
      router.refresh();
    } catch (e) {
      setPrepError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPrepBusy(false);
    }
  }

  async function handleFindContacts() {
    setContactsBusy(true);
    setContactsError("");
    try {
      const res = await fetch("/api/ai/hiring-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: app.role,
          jobCompany: app.company,
          jobDesc: app.job_desc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not suggest contacts");
      setMockMode(Boolean(data.mock));
      const contacts = (data.contacts ?? []) as HiringContact[];
      patchLocal({ hiring_contacts: contacts });
      await updateApplicationHiringContacts(app.id, contacts);
      router.refresh();
    } catch (e) {
      setContactsError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setContactsBusy(false);
    }
  }

  function saveCoverLetter(text: string) {
    patchLocal({ cover_letter: text });
    startTransition(async () => {
      await updateApplicationCoverLetter(app.id, text);
      router.refresh();
    });
  }

  function copyCover() {
    if (app.cover_letter) {
      void navigator.clipboard.writeText(app.cover_letter);
    }
  }

  function exportResume() {
    const html = buildResumeHTML(
      {
        templateStyle: app.resume_snapshot.template_style,
        data: app.resume_snapshot.data,
      },
      true
    );
    openPrintHtml(html);
  }

  function exportCover() {
    const html = buildCoverHTML(app.cover_letter, {
      name: app.resume_snapshot.data.name,
      phone: app.resume_snapshot.data.phone,
      email: app.resume_snapshot.data.email,
      location: app.resume_snapshot.data.location,
    });
    openPrintHtml(html);
  }

  const fitStyle = fitScoreStyle(app.insight?.fitScore);

  return (
    <div className="scroll flex-1 overflow-auto bg-page">
      <div className="mx-auto max-w-[1180px] px-10 pb-16 pt-[26px]">
        {companyHistory.length > 0 && (
          <div className="mb-4 rounded-xl border border-[#D6E4FF] bg-[#EAF1FF] px-4 py-3">
            <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#2456D6]">
              Applied here before
            </div>
            <p className="mt-1 text-[13px] text-[#2b3140]">
              You have {companyHistory.length} other application
              {companyHistory.length === 1 ? "" : "s"} at {app.company.trim() || "this company"}.
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {companyHistory.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/applications/${item.id}`}
                    className="text-[13px] font-semibold text-[#2456D6] hover:underline"
                  >
                    {item.role || "Untitled role"} · {formatAppDate(item.applied_at)} ·{" "}
                    {appStatusMeta(item.status).label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-[18px] flex items-center gap-3">
          <Link
            href="/applications"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E2E5EA] bg-white text-[17px] text-[#3a4350] transition-colors hover:border-accent hover:text-accent"
            aria-label="Back to applications"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[21px] font-semibold tracking-[-0.02em] text-ink">
              {title}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-[12.5px] font-semibold text-muted">
                Applied
                <input
                  type="date"
                  value={appliedDateInputValue(app.applied_at)}
                  onChange={(e) => {
                    const iso = appliedDateFromInput(e.target.value);
                    if (!iso) return;
                    patchLocal({ applied_at: iso });
                    startTransition(async () => {
                      await updateApplicationMeta(app.id, { applied_at: iso });
                      router.refresh();
                    });
                  }}
                  className="rounded-[9px] border border-[#DFE3E8] px-2.5 py-1.5 text-[13px] text-ink focus:border-accent"
                />
              </label>
              {app.resume_version_name ? (
                <span className="text-[12.5px] text-[#8A92A0]">
                  · Resume: {app.resume_version_name}
                </span>
              ) : null}
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border px-[11px] py-[5px] text-xs font-bold"
            style={{
              background: statusMeta.bg,
              color: statusMeta.fg,
              borderColor: statusMeta.bd,
            }}
          >
            {statusMeta.label}
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={handleDelete}
            className="cursor-pointer rounded-[9px] border border-[#E0E3E8] bg-white px-[13px] py-[9px] text-[12.5px] font-semibold text-[#B23B3B] transition-colors hover:border-[#E0A0A0] hover:bg-[#FFF6F6] disabled:opacity-50"
          >
            Delete
          </button>
        </div>

        {mockMode && (
          <div className={`mb-4 ${mockBannerClass}`}>
            Demo AI mode — add ANTHROPIC_API_KEY for production output.
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-2">
          {/* Left column */}
          <div className="flex flex-col gap-[18px]">
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="mb-[13px] font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-[#8A92A0]">
                Outcome
              </div>
              <div className="flex flex-wrap gap-2">
                {APPLICATION_STATUSES.map((st) => {
                  const sm = appStatusMeta(st.id);
                  const on = app.status === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      disabled={pending}
                      onClick={() => setStatus(st.id)}
                      className="cursor-pointer rounded-[9px] border px-[13px] py-2 text-[12.5px] transition-all duration-150 disabled:opacity-60"
                      style={{
                        borderColor: on ? sm.bd : "#E2E5EA",
                        background: on ? sm.bg : "#fff",
                        color: on ? sm.fg : "#7A828F",
                        fontWeight: on ? 700 : 600,
                      }}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-[5px] text-xs font-semibold text-muted">
                  Role
                  <input
                    value={app.role}
                    onChange={(e) => patchLocal({ role: e.target.value })}
                    onBlur={(e) => saveMeta({ role: e.target.value })}
                    placeholder="Role"
                    className="rounded-[9px] border border-[#DFE3E8] px-2.5 py-2 text-[13.5px] text-ink focus:border-accent"
                  />
                </label>
                <label className="flex flex-col gap-[5px] text-xs font-semibold text-muted">
                  Company
                  <input
                    value={app.company}
                    onChange={(e) => patchLocal({ company: e.target.value })}
                    onBlur={(e) => saveMeta({ company: e.target.value })}
                    placeholder="Company"
                    className="rounded-[9px] border border-[#DFE3E8] px-2.5 py-2 text-[13.5px] text-ink focus:border-accent"
                  />
                </label>
              </div>
              <p className="mt-2 text-[11.5px] text-[#9AA3AF]">Saves automatically</p>
            </div>

            <div className="rounded-2xl bg-sidebar px-[22px] py-5 text-[#E4E8EE]">
              <div className="mb-1 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 font-display text-sm font-semibold text-[#9FC0FF]">
                  ✦ Fit & gaps
                </div>
                {app.insight && (
                  <div
                    className="flex h-[62px] w-[62px] flex-none flex-col items-center justify-center rounded-[14px] border font-display font-bold"
                    style={{
                      background: fitStyle.bg,
                      color: fitStyle.fg,
                      borderColor: fitStyle.bd,
                    }}
                  >
                    <span className="text-lg leading-none">
                      {app.insight.fitScore}
                    </span>
                    <span className="mt-0.5 text-[8.5px] font-semibold tracking-[0.05em] opacity-80">
                      FIT
                    </span>
                  </div>
                )}
              </div>
              {insightError && (
                <div className="my-2 text-[12.5px] text-[#FF9B9B]">
                  {insightError}
                </div>
              )}
              {app.insight && (
                <>
                  <div className="mt-2 text-xs font-bold uppercase tracking-[0.05em] text-[#7FE0B0]">
                    Strengths
                  </div>
                  <ul className="mt-1.5 list-disc pl-[18px] text-[13px] leading-[1.55] text-[#C7CDD6]">
                    {app.insight.strengths.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                  <div className="mt-3 text-xs font-bold uppercase tracking-[0.05em] text-[#F2C97A]">
                    Gaps
                  </div>
                  <ul className="mt-1.5 list-disc pl-[18px] text-[13px] leading-[1.55] text-[#C7CDD6]">
                    {app.insight.gaps.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                  <div className="mt-3 rounded-[10px] bg-[rgba(159,192,255,0.12)] px-[13px] py-[11px] text-[13px] leading-[1.55] text-[#DCE6FF]">
                    💡 {app.insight.advice}
                  </div>
                </>
              )}
              <button
                type="button"
                disabled={insightBusy}
                onClick={handleAnalyze}
                className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-[10px] border-none bg-white/10 py-[11px] text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.18] disabled:opacity-60"
              >
                {insightBusy && <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" />}
                {insightBusy
                  ? "Analyzing…"
                  : app.insight
                    ? "↻ Re-analyze fit"
                    : "✦ Analyze fit & gaps"}
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="mb-[13px] flex items-center justify-between">
                <div className="font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-[#8A92A0]">
                  Timeline & reminders
                </div>
                <div className="flex gap-[7px]">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const ev = await addApplicationEvent(app.id, "interview");
                        patchLocal({
                          events: [ev, ...(app.events ?? [])],
                        });
                        router.refresh();
                      })
                    }
                    className="cursor-pointer rounded-lg border-none bg-[#FEF3DA] px-[11px] py-1.5 text-xs font-semibold text-[#9A6212] transition-colors hover:bg-[#fbe9c2] disabled:opacity-50"
                  >
                    + Interview
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const ev = await addApplicationEvent(app.id, "followup");
                        patchLocal({
                          events: [ev, ...(app.events ?? [])],
                        });
                        router.refresh();
                      })
                    }
                    className="cursor-pointer rounded-lg border-none bg-[#EAF1FF] px-[11px] py-1.5 text-xs font-semibold text-[#2456D6] transition-colors hover:bg-[#dbe7ff] disabled:opacity-50"
                  >
                    + Follow-up
                  </button>
                </div>
              </div>
              {sortedEvents.length > 0 ? (
                <div className="flex flex-col gap-[9px]">
                  {sortedEvents.map((e) => {
                    const overdue =
                      !e.done && e.date != null && e.date < todayISO();
                    return (
                      <div
                        key={e.id}
                        className="flex items-start gap-2.5 rounded-[11px] border border-[#EEF0F3] px-3 py-[11px]"
                      >
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              await updateApplicationEvent(e.id, app.id, {
                                done: !e.done,
                              });
                              patchLocal({
                                events: (app.events ?? []).map((ev) =>
                                  ev.id === e.id ? { ...ev, done: !ev.done } : ev
                                ),
                              });
                              router.refresh();
                            })
                          }
                          className="flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded-md border-[1.5px] text-xs text-white disabled:opacity-50"
                          style={{
                            borderColor: e.done ? "#0E9F6E" : "#CBD2DB",
                            background: e.done ? "#0E9F6E" : "#fff",
                          }}
                        >
                          {e.done ? "✓" : ""}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#141821]">
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ background: eventDotColor(e.type) }}
                              />
                              {appEventLabel(e.type)}
                            </span>
                            <input
                              type="date"
                              value={e.date ?? ""}
                              disabled={pending}
                              onChange={(ev) => {
                                const date = ev.target.value;
                                patchLocal({
                                  events: (app.events ?? []).map((item) =>
                                    item.id === e.id ? { ...item, date } : item
                                  ),
                                });
                                startTransition(async () => {
                                  await updateApplicationEvent(e.id, app.id, {
                                    date,
                                  });
                                  router.refresh();
                                });
                              }}
                              className="rounded-md border border-[#E2E5EA] px-[7px] py-1 text-xs text-[#3a4350]"
                            />
                            <input
                              value={e.time}
                              disabled={pending}
                              onChange={(ev) => {
                                const time = ev.target.value;
                                patchLocal({
                                  events: (app.events ?? []).map((item) =>
                                    item.id === e.id ? { ...item, time } : item
                                  ),
                                });
                              }}
                              onBlur={(ev) =>
                                startTransition(async () => {
                                  await updateApplicationEvent(e.id, app.id, {
                                    time: ev.target.value,
                                  });
                                  router.refresh();
                                })
                              }
                              placeholder="time"
                              className="w-[78px] rounded-md border border-[#E2E5EA] px-[7px] py-1 text-xs text-[#3a4350]"
                            />
                            {overdue && (
                              <span className="rounded-[5px] bg-[#FCECEC] px-[7px] py-0.5 text-[10.5px] font-bold text-[#B23B3B]">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <input
                            value={e.notes}
                            disabled={pending}
                            onChange={(ev) =>
                              patchLocal({
                                events: (app.events ?? []).map((item) =>
                                  item.id === e.id
                                    ? { ...item, notes: ev.target.value }
                                    : item
                                ),
                              })
                            }
                            onBlur={(ev) =>
                              startTransition(async () => {
                                await updateApplicationEvent(e.id, app.id, {
                                  notes: ev.target.value,
                                });
                                router.refresh();
                              })
                            }
                            placeholder="Add a note…"
                            className="mt-[7px] w-full border-none border-b border-[#EEF0F3] bg-transparent px-px py-1 text-[12.5px] text-[#3a4350] focus:border-accent"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              await deleteApplicationEvent(e.id, app.id);
                              patchLocal({
                                events: (app.events ?? []).filter(
                                  (ev) => ev.id !== e.id
                                ),
                              });
                              router.refresh();
                            })
                          }
                          className="cursor-pointer border-none bg-transparent p-0.5 text-[13px] text-[#b9bfc8] hover:text-[#B23B3B] disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="mb-[11px] font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-[#8A92A0]">
                Notes
              </div>
              <textarea
                value={app.notes}
                onChange={(e) => patchLocal({ notes: e.target.value })}
                onBlur={(e) => saveMeta({ notes: e.target.value })}
                rows={3}
                placeholder="Recruiter name, referral, salary range, where you found it…"
                className="w-full resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-[11px] text-[13.5px] leading-[1.55] text-[#1a1f29] focus:border-accent"
              />
              <p className="mt-2 text-[11.5px] text-[#9AA3AF]">Saves automatically</p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="mb-[11px] flex items-center justify-between gap-3">
                <div className="font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-[#8A92A0]">
                  Hiring contacts
                </div>
                <button
                  type="button"
                  disabled={contactsBusy}
                  onClick={handleFindContacts}
                  className="inline-flex cursor-pointer items-center gap-[7px] rounded-[9px] border-none bg-[#F2F3F5] px-[13px] py-[7px] text-[12.5px] font-semibold text-[#3a4350] transition-colors hover:bg-[#E6E8EC] disabled:opacity-60"
                >
                  {contactsBusy && <Spinner className="h-3.5 w-3.5" />}
                  {contactsBusy ? "Researching…" : "✦ Suggest contacts"}
                </button>
              </div>
              {contactsError ? (
                <p className="mb-2 text-[12.5px] text-[#B23B3B]">{contactsError}</p>
              ) : null}
              {app.hiring_contacts && app.hiring_contacts.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {app.hiring_contacts.map((contact, index) => (
                    <div
                      key={`${contact.name}-${index}`}
                      className="rounded-[11px] border border-[#EEF0F3] bg-[#FCFCFD] px-3.5 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-bold text-ink">
                          {contact.name || "Unknown name"}
                        </span>
                        <span className="text-[12px] font-semibold text-muted">
                          {contact.title}
                        </span>
                        <span className="rounded-md bg-[#F2F3F5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6B7480]">
                          {contact.confidence} confidence
                        </span>
                      </div>
                      <p className="mt-2 text-[13px] leading-[1.55] text-muted">
                        {contact.rationale}
                      </p>
                    </div>
                  ))}
                  <p className="text-[11.5px] text-[#9AA3AF]">
                    AI-suggested roles — verify on LinkedIn or the company site before
                    reaching out. We don&apos;t store verified emails.
                  </p>
                </div>
              ) : (
                <p className="text-[13px] leading-[1.55] text-[#8A92A0]">
                  Get likely hiring manager or recruiter titles based on this role and
                  company. Best after the job description is filled in.
                </p>
              )}
            </div>
          </div>

          {/* Right column — snapshots */}
          <div className="flex flex-col gap-[18px]">
            <div className="rounded-2xl border border-border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-[#8A92A0]">
                    Resume sent
                  </div>
                  <div className="mt-[3px] text-[12.5px] text-muted">
                    {app.resume_version_name} ·{" "}
                    {templateLabel(app.resume_snapshot.template_style)}
                  </div>
                </div>
                <div className="flex gap-[7px]">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="cursor-pointer rounded-[9px] border-none bg-[#F2F3F5] px-[13px] py-2 text-[12.5px] font-semibold text-[#3a4350] transition-colors hover:bg-[#E6E8EC]"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={exportResume}
                    className="cursor-pointer rounded-[9px] border-none bg-accent px-[13px] py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-accent-dark"
                  >
                    ↓ Export
                  </button>
                  <ReplaceResumeControls
                    applicationId={app.id}
                    currentVersionId={app.resume_version_id}
                    templateStyle={app.resume_snapshot.template_style}
                    versions={resumeVersions}
                    onReplaced={(patch) => patchLocal(patch)}
                  />
                </div>
              </div>
              <div className="flex justify-center py-1">
                <div className="h-[431px] w-full max-w-[334px] overflow-hidden rounded-[9px] border border-[#EEF0F3] bg-white shadow-[0_2px_10px_rgba(15,17,22,0.07)]">
                  <iframe
                    srcDoc={snapHtml}
                    scrolling="no"
                    title="Resume snapshot"
                    className="block h-[1052px] w-[816px] origin-top-left scale-[0.41] border-none bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-4">
              <div className="mb-[11px] flex flex-wrap items-center justify-between gap-2">
                <div className="font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-[#8A92A0]">
                  Cover letter sent
                </div>
                <div className="flex flex-wrap items-center justify-end gap-[7px]">
                  {app.cover_letter.trim() ? (
                    <>
                      <button
                        type="button"
                        onClick={copyCover}
                        className="cursor-pointer rounded-lg border-none bg-[#F2F3F5] px-[11px] py-1.5 text-xs font-semibold text-[#3a4350] transition-colors hover:bg-[#E6E8EC]"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={exportCover}
                        className="cursor-pointer rounded-lg border-none bg-accent px-[11px] py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-dark"
                      >
                        ↓ PDF
                      </button>
                    </>
                  ) : null}
                  <CoverLetterControls
                    applicationId={app.id}
                    role={app.role}
                    company={app.company}
                    savedLetters={savedCoverLetters}
                    onImported={(text) => patchLocal({ cover_letter: text })}
                  />
                </div>
              </div>
              <textarea
                value={app.cover_letter}
                onChange={(e) => patchLocal({ cover_letter: e.target.value })}
                onBlur={(e) => saveCoverLetter(e.target.value)}
                rows={8}
                placeholder="Paste the cover letter you sent with this application…"
                className="w-full resize-y rounded-[10px] border border-[#DFE3E8] px-3.5 py-3 text-[13.3px] leading-[1.65] text-[#1a1f29] focus:border-accent"
              />
              <p className="mt-2 text-[11.5px] text-[#9AA3AF]">
                Saves automatically. Use Attach to import from saved letters or your job draft.
              </p>
            </div>

            {app.answers.length > 0 && (
              <div className="rounded-2xl border border-border bg-white p-4">
                <div className="mb-3 font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-[#8A92A0]">
                  Application answers sent
                </div>
                <div className="flex flex-col gap-[11px]">
                  {app.answers.map((qa, i) => (
                    <div
                      key={i}
                      className="rounded-[11px] border border-[#EEF0F3] bg-[#FCFCFD] px-3.5 py-3"
                    >
                      <div className="mb-[5px] text-[13px] font-bold text-[#141821]">
                        {qa.q}
                      </div>
                      <div className="whitespace-pre-wrap text-[13px] leading-[1.6] text-[#3a4350]">
                        {qa.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border bg-white p-4">
              <div className="mb-[11px] flex items-center justify-between">
                <div className="font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-[#8A92A0]">
                  Interview prep
                </div>
                <button
                  type="button"
                  disabled={prepBusy}
                  onClick={handleGenPrep}
                  className="inline-flex cursor-pointer items-center gap-[7px] rounded-[9px] border-none bg-sidebar px-[13px] py-[7px] text-[12.5px] font-semibold text-white transition-colors hover:bg-[#272b33] disabled:opacity-60"
                >
                  {prepBusy && (
                    <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" />
                  )}
                  {prepBusy
                    ? "Preparing…"
                    : app.prep
                      ? "↻ Regenerate prep"
                      : "✦ Generate interview prep"}
                </button>
              </div>
              {prepError && (
                <div className="mb-2 text-[12.5px] text-[#B23B3B]">
                  {prepError}
                </div>
              )}
              {app.prep ? (
                <>
                  <div className="text-[11.5px] font-bold uppercase tracking-[0.05em] text-[#9A6212]">
                    Likely questions
                  </div>
                  <ul className="mt-1.5 list-disc pl-[18px] text-[13px] leading-[1.55] text-[#2b3140]">
                    {app.prep.questions.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                  <div className="mt-3 text-[11.5px] font-bold uppercase tracking-[0.05em] text-[#0E7C4B]">
                    Lead with
                  </div>
                  <ul className="mt-1.5 list-disc pl-[18px] text-[13px] leading-[1.55] text-[#2b3140]">
                    {app.prep.talkingPoints.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                  <div className="mt-3 text-[11.5px] font-bold uppercase tracking-[0.05em] text-[#2456D6]">
                    Ask them
                  </div>
                  <ul className="mt-1.5 list-disc pl-[18px] text-[13px] leading-[1.55] text-[#2b3140]">
                    {app.prep.ask.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-[12.8px] leading-normal text-[#8A92A0]">
                  Generate likely questions, proof points to lead with, and
                  smart questions to ask — drawn from this role&apos;s JD and the
                  resume you sent.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-white p-4">
              <div className="mb-[11px] font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-[#8A92A0]">
                Job description
              </div>
              <label className="mb-3 flex flex-col gap-[5px] text-xs font-semibold text-muted">
                Posting URL
                <div className="flex gap-2">
                  <input
                    value={app.job_url}
                    onChange={(e) => patchLocal({ job_url: e.target.value })}
                    onBlur={(e) => saveMeta({ job_url: e.target.value })}
                    placeholder="https://www.indeed.com/viewjob?jk=…"
                    className="min-w-0 flex-1 rounded-[9px] border border-[#DFE3E8] px-2.5 py-2 text-[13.5px] text-ink focus:border-accent"
                  />
                  {app.job_url.trim() ? (
                    <a
                      href={app.job_url.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center rounded-[9px] border border-[#DFE3E8] bg-[#FAFBFC] px-3 text-[12.5px] font-semibold text-[#2456D6] hover:border-accent"
                    >
                      Open ↗
                    </a>
                  ) : null}
                </div>
              </label>
              <textarea
                value={app.job_desc}
                onChange={(e) => patchLocal({ job_desc: e.target.value })}
                onBlur={(e) => saveMeta({ job_desc: e.target.value })}
                rows={4}
                placeholder="Paste the JD for fit analysis and interview prep…"
                className="w-full resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-[11px] text-[13.5px] leading-[1.55] text-[#1a1f29] focus:border-accent"
              />
              <p className="mt-2 text-[11.5px] text-[#9AA3AF]">Saves automatically</p>
            </div>
          </div>
        </div>
      </div>

      <ResumePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`${app.resume_version_name ?? "Resume"} · ${templateLabel(app.resume_snapshot.template_style)}`}
        html={snapHtml}
        onExport={exportResume}
      />
    </div>
  );
}
