"use client";

import { ApplicationAnswersEditor } from "@/components/applications/application-answers-editor";
import { CoverLetterControls } from "@/components/applications/cover-letter-controls";
import { DetailSection } from "@/components/applications/detail-section";
import { ReplaceResumeControls } from "@/components/applications/replace-resume-controls";
import { Spinner } from "@/components/ui/spinner";
import type { Application, ApplicationAnswer, ApplicationStatus } from "@/lib/applications/types";
import {
  APPLICATION_STATUSES,
  appEventLabel,
  appStatusMeta,
  appliedDateFromInput,
  appliedDateInputValue,
  eventDotColor,
  formatHiringContactDisplay,
  todayISO,
} from "@/lib/applications/utils";
import type { CoverLetter } from "@/lib/cover/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { templateLabel } from "@/lib/resume/build-resume-html";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { TransitionStartFunction } from "react";
import {
  addApplicationEvent,
  deleteApplicationEvent,
  updateApplicationEvent,
  updateApplicationMeta,
} from "@/lib/applications/actions";

export type DetailTab = "overview" | "sent" | "prep";

type FitStyle = { bg: string; fg: string; bd: string };

type ApplicationDetailPanelsProps = {
  tab: DetailTab;
  app: Application;
  pending: boolean;
  sortedEvents: Application["events"];
  fitStyle: FitStyle;
  snapHtml: string;
  resumeVersions: ResumeVersion[];
  savedCoverLetters: CoverLetter[];
  insightBusy: boolean;
  insightError: string;
  prepBusy: boolean;
  prepError: string;
  contactsBusy: boolean;
  contactsError: string;
  patchLocal: (patch: Partial<Application>) => void;
  saveMeta: (patch: Parameters<typeof updateApplicationMeta>[1]) => void;
  setStatus: (status: ApplicationStatus) => void;
  saveCoverLetter: (text: string) => void;
  saveAnswers: (answers: ApplicationAnswer[]) => void;
  copyCover: () => void;
  exportResume: () => void;
  exportCover: () => void;
  setPreviewOpen: (open: boolean) => void;
  handleAnalyze: () => void;
  handleGenPrep: () => void;
  handleFindContacts: () => void;
  startTransition: TransitionStartFunction;
  router: AppRouterInstance;
};

export function ApplicationDetailPanels({
  tab,
  app,
  pending,
  sortedEvents,
  fitStyle,
  snapHtml,
  resumeVersions,
  savedCoverLetters,
  insightBusy,
  insightError,
  prepBusy,
  prepError,
  contactsBusy,
  contactsError,
  patchLocal,
  saveMeta,
  setStatus,
  saveCoverLetter,
  saveAnswers,
  copyCover,
  exportResume,
  exportCover,
  setPreviewOpen,
  handleAnalyze,
  handleGenPrep,
  handleFindContacts,
  startTransition,
  router,
}: ApplicationDetailPanelsProps) {
  if (tab === "overview") {
    return (
      <div className="flex flex-col gap-4">
        <DetailSection title="Outcome">
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
                  className="cursor-pointer rounded-[9px] border px-3 py-2 text-[12.5px] transition-all duration-150 disabled:opacity-60"
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
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
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
            <label className="flex flex-col gap-[5px] text-xs font-semibold text-muted sm:col-span-2">
              Applied date
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
                className="max-w-[220px] rounded-[9px] border border-[#DFE3E8] px-2.5 py-2 text-[13.5px] text-ink focus:border-accent"
              />
            </label>
          </div>
          <p className="mt-2 text-[11.5px] text-[#9AA3AF]">Saves automatically</p>
        </DetailSection>

        <DetailSection
          title="Timeline & reminders"
          actions={
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const ev = await addApplicationEvent(app.id, "interview");
                    patchLocal({ events: [ev, ...(app.events ?? [])] });
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
                    patchLocal({ events: [ev, ...(app.events ?? [])] });
                    router.refresh();
                  })
                }
                className="cursor-pointer rounded-lg border-none bg-[#EAF1FF] px-[11px] py-1.5 text-xs font-semibold text-[#2456D6] transition-colors hover:bg-[#dbe7ff] disabled:opacity-50"
              >
                + Follow-up
              </button>
            </>
          }
        >
          {sortedEvents && sortedEvents.length > 0 ? (
            <div className="flex flex-col gap-2">
              {sortedEvents.map((e) => {
                const overdue = !e.done && e.date != null && e.date < todayISO();
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
                          await updateApplicationEvent(e.id, app.id, { done: !e.done });
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
                              await updateApplicationEvent(e.id, app.id, { date });
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
                        {overdue ? (
                          <span className="rounded-[5px] bg-[#FCECEC] px-[7px] py-0.5 text-[10.5px] font-bold text-[#B23B3B]">
                            OVERDUE
                          </span>
                        ) : null}
                      </div>
                      <input
                        value={e.notes}
                        disabled={pending}
                        onChange={(ev) =>
                          patchLocal({
                            events: (app.events ?? []).map((item) =>
                              item.id === e.id ? { ...item, notes: ev.target.value } : item
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
                            events: (app.events ?? []).filter((ev) => ev.id !== e.id),
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
          ) : (
            <p className="text-[13px] text-[#8A92A0]">
              Add interview dates or follow-up reminders so nothing slips through.
            </p>
          )}
        </DetailSection>

        <DetailSection title="Notes">
          <textarea
            value={app.notes}
            onChange={(e) => patchLocal({ notes: e.target.value })}
            onBlur={(e) => saveMeta({ notes: e.target.value })}
            rows={3}
            placeholder="Recruiter name, referral, salary range, where you found it…"
            className="w-full resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-[11px] text-[13.5px] leading-[1.55] text-[#1a1f29] focus:border-accent"
          />
          <p className="mt-2 text-[11.5px] text-[#9AA3AF]">Saves automatically</p>
        </DetailSection>

        <DetailSection
          title="Job posting"
          description="Powers fit analysis, interview prep, and role suggestions on the Prepare tab."
        >
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
            rows={6}
            placeholder="Paste the job description…"
            className="w-full resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-[11px] text-[13.5px] leading-[1.55] text-[#1a1f29] focus:border-accent"
          />
          <p className="mt-2 text-[11.5px] text-[#9AA3AF]">Saves automatically</p>
        </DetailSection>
      </div>
    );
  }

  if (tab === "sent") {
    return (
      <div className="flex flex-col gap-4">
        <DetailSection
          title="Resume sent"
          description={`${app.resume_version_name ?? "Snapshot"} · ${templateLabel(app.resume_snapshot.template_style)}`}
          actions={
            <>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="cursor-pointer rounded-[9px] border-none bg-[#F2F3F5] px-3 py-2 text-[12.5px] font-semibold text-[#3a4350] transition-colors hover:bg-[#E6E8EC]"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={exportResume}
                className="cursor-pointer rounded-[9px] border-none bg-accent px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-accent-dark"
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
            </>
          }
        >
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
        </DetailSection>

        <DetailSection
          title="Cover letter sent"
          actions={
            <>
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
                onApplied={(text) => patchLocal({ cover_letter: text })}
              />
            </>
          }
        >
          <textarea
            value={app.cover_letter}
            onChange={(e) => patchLocal({ cover_letter: e.target.value })}
            onBlur={(e) => saveCoverLetter(e.target.value)}
            rows={8}
            placeholder="Paste the cover letter you sent with this application…"
            className="w-full resize-y rounded-[10px] border border-[#DFE3E8] px-3.5 py-3 text-[13.3px] leading-[1.65] text-[#1a1f29] focus:border-accent"
          />
          <p className="mt-2 text-[11.5px] text-[#9AA3AF]">
            Paste text, upload a PDF you sent, or pull from a saved letter. Saves automatically.
          </p>
        </DetailSection>

        <DetailSection
          title="Application Q&A"
          description="Questions from the application form and the answers you sent."
        >
          <ApplicationAnswersEditor application={app} onSave={saveAnswers} />
        </DetailSection>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DetailSection
        title="Fit & gaps"
        variant="dark"
        actions={
          app.insight ? (
            <div
              className="flex h-[52px] w-[52px] flex-none flex-col items-center justify-center rounded-[12px] border font-display font-bold"
              style={{
                background: fitStyle.bg,
                color: fitStyle.fg,
                borderColor: fitStyle.bd,
              }}
            >
              <span className="text-base leading-none">{app.insight.fitScore}</span>
              <span className="mt-0.5 text-[8px] font-semibold tracking-[0.05em] opacity-80">
                FIT
              </span>
            </div>
          ) : null
        }
      >
        {insightError ? (
          <div className="mb-2 text-[12.5px] text-[#FF9B9B]">{insightError}</div>
        ) : null}
        {app.insight ? (
          <>
            <div className="text-xs font-bold uppercase tracking-[0.05em] text-[#7FE0B0]">
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
        ) : (
          <p className="text-[13px] leading-[1.55] text-[#AEB6C2]">
            Compare this role against the resume snapshot you sent — strengths, gaps, and
            advice.
          </p>
        )}
        <button
          type="button"
          disabled={insightBusy}
          onClick={handleAnalyze}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-[10px] border-none bg-white/10 py-[11px] text-[13px] font-semibold text-white transition-colors hover:bg-white/[0.18] disabled:opacity-60"
        >
          {insightBusy && <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" />}
          {insightBusy ? "Analyzing…" : app.insight ? "↻ Re-analyze fit" : "✦ Analyze fit & gaps"}
        </button>
      </DetailSection>

      <DetailSection
        title="Interview prep"
        actions={
          <button
            type="button"
            disabled={prepBusy}
            onClick={handleGenPrep}
            className="inline-flex cursor-pointer items-center gap-[7px] rounded-[9px] border-none bg-sidebar px-[13px] py-[7px] text-[12.5px] font-semibold text-white transition-colors hover:bg-[#272b33] disabled:opacity-60"
          >
            {prepBusy && <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" />}
            {prepBusy ? "Preparing…" : app.prep ? "↻ Regenerate" : "✦ Generate prep"}
          </button>
        }
      >
        {prepError ? <div className="mb-2 text-[12.5px] text-[#B23B3B]">{prepError}</div> : null}
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
          <p className="text-[13px] leading-normal text-[#8A92A0]">
            Generate likely questions, proof points, and smart questions to ask — from this
            job description and the resume you sent.
          </p>
        )}
      </DetailSection>

      <DetailSection
        title="Who to look up"
        description="AI suggests roles to search on LinkedIn — not real people or emails."
        actions={
          <button
            type="button"
            disabled={contactsBusy}
            onClick={handleFindContacts}
            className="inline-flex shrink-0 cursor-pointer items-center gap-[7px] rounded-[9px] border-none bg-[#F2F3F5] px-[13px] py-[7px] text-[12.5px] font-semibold text-[#3a4350] transition-colors hover:bg-[#E6E8EC] disabled:opacity-60"
          >
            {contactsBusy && <Spinner className="h-3.5 w-3.5" />}
            {contactsBusy ? "Suggesting…" : "✦ Suggest roles"}
          </button>
        }
      >
        {contactsError ? (
          <p className="mb-2 text-[12.5px] text-[#B23B3B]">{contactsError}</p>
        ) : null}
        {app.hiring_contacts && app.hiring_contacts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {app.hiring_contacts.map((contact, index) => {
              const display = formatHiringContactDisplay(contact);
              return (
                <div
                  key={`${contact.name}-${contact.title}-${index}`}
                  className="rounded-[11px] border border-[#EEF0F3] bg-[#FCFCFD] px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {display.kind === "role" ? (
                      <span className="rounded-md bg-[#EAF1FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[#2456D6]">
                        Role to research
                      </span>
                    ) : null}
                    <span className="text-[14px] font-bold text-ink">{display.headline}</span>
                    {display.subtitle ? (
                      <span className="text-[12px] font-semibold text-muted">
                        {display.subtitle}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.55] text-muted">{contact.rationale}</p>
                </div>
              );
            })}
            <p className="text-[11.5px] text-[#9AA3AF]">
              Search these titles on LinkedIn — we don&apos;t look anyone up for you.
            </p>
          </div>
        ) : (
          <p className="text-[13px] leading-[1.55] text-[#8A92A0]">
            Get likely hiring-manager or recruiter titles from the job description, then search
            for real people yourself.
          </p>
        )}
      </DetailSection>
    </div>
  );
}
