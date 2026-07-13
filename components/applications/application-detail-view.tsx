"use client";

import {
  ApplicationDetailPanels,
  type DetailTab,
} from "@/components/applications/application-detail-panels";
import { ResumePreviewModal } from "@/components/applications/resume-preview-modal";
import type { Application, ApplicationStatus, HiringContact } from "@/lib/applications/types";
import {
  archiveApplication,
  deleteApplication,
  restoreApplication,
  updateApplicationAnswers,
  updateApplicationCoverLetter,
  updateApplicationHiringContacts,
  updateApplicationInsight,
  updateApplicationInterviewDebrief,
  updateApplicationInterviewTranscript,
  updateApplicationMeta,
  updateApplicationPrep,
  updateApplicationStatus,
} from "@/lib/applications/actions";
import { computeFollowUpRecommendations } from "@/lib/applications/follow-up-recommendations";
import {
  appStatusMeta,
  applicationDetailTitle,
  fitScoreStyle,
  formatAppDate,
} from "@/lib/applications/utils";
import { mockBannerClass } from "@/components/shared/job-fields";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { CoverLetter } from "@/lib/cover/types";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { templateLabel } from "@/lib/resume/build-resume-html";
import {
  buildCoverHTML,
  openPrintHtml,
} from "@/lib/resume/build-cover-html";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { FollowUpKind } from "@/lib/applications/follow-up-types";

type ApplicationDetailViewProps = {
  application: Application;
  resumeVersions: ResumeVersion[];
  savedCoverLetters: CoverLetter[];
  companyHistory: Pick<
    Application,
    "id" | "role" | "company" | "applied_at" | "status"
  >[];
  isStudent?: boolean;
};

const DETAIL_TABS: { id: DetailTab; label: string; hint: string }[] = [
  { id: "overview", label: "Overview", hint: "Status, timeline, job posting" },
  { id: "sent", label: "What you sent", hint: "Resume, cover letter, answers" },
  { id: "prep", label: "Prepare", hint: "Fit, prep, debrief, research" },
];

export function ApplicationDetailView({
  application: initial,
  resumeVersions,
  savedCoverLetters,
  companyHistory,
  isStudent = false,
}: ApplicationDetailViewProps) {
  const router = useRouter();
  const [app, setApp] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [insightBusy, setInsightBusy] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [prepBusy, setPrepBusy] = useState(false);
  const [prepError, setPrepError] = useState("");
  const [debriefBusy, setDebriefBusy] = useState(false);
  const [debriefError, setDebriefError] = useState("");
  const [debriefFocus, setDebriefFocus] = useState("");
  const [contactsBusy, setContactsBusy] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [confirmKind, setConfirmKind] = useState<"archive" | "delete" | null>(null);
  const [tab, setTab] = useState<DetailTab>("overview");

  useEffect(() => {
    setApp(initial);
  }, [initial]);

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

  const followUpRecommendations = useMemo(
    () => computeFollowUpRecommendations(app),
    [app]
  );

  function handleFollowUpDismissed(recommendationId: FollowUpKind) {
    patchLocal({
      follow_up_dismissed: [...(app.follow_up_dismissed ?? []), recommendationId],
    });
  }

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

  function handleArchive() {
    setConfirmKind("archive");
  }

  function handleRestore() {
    startTransition(async () => {
      await restoreApplication(app.id);
      patchLocal({ archived_at: null });
      router.refresh();
    });
  }

  function handleDelete() {
    setConfirmKind("delete");
  }

  function handleConfirmedAction() {
    const kind = confirmKind;
    if (!kind) return;
    startTransition(async () => {
      if (kind === "archive") {
        await archiveApplication(app.id);
        patchLocal({ archived_at: new Date().toISOString() });
        setConfirmKind(null);
        router.refresh();
      } else {
        await deleteApplication(app.id);
        setConfirmKind(null);
        router.push("/applications");
      }
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

  async function handleAnalyzeDebrief() {
    const transcript = app.interview_transcript.trim();
    if (transcript.length < 40) {
      setDebriefError("Paste at least a few lines of transcript first.");
      return;
    }

    setDebriefBusy(true);
    setDebriefError("");
    try {
      const res = await fetch("/api/ai/interview-debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobRole: app.role,
          jobCompany: app.company,
          jobDesc: app.job_desc,
          summary: app.resume_snapshot.data.summary,
          coverLetter: app.cover_letter,
          prepQuestions: app.prep?.questions ?? [],
          transcript,
          focusNote: debriefFocus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Debrief failed");
      setMockMode(Boolean(data.mock));
      patchLocal({ interview_debrief: data.debrief });
      await updateApplicationInterviewDebrief(app.id, data.debrief);
      router.refresh();
    } catch (e) {
      setDebriefError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setDebriefBusy(false);
    }
  }

  function saveInterviewTranscript(text: string) {
    patchLocal({ interview_transcript: text });
    startTransition(async () => {
      await updateApplicationInterviewTranscript(app.id, text);
      router.refresh();
    });
  }

  function copyFollowUpEmail() {
    const email = app.interview_debrief?.followUpEmail?.trim();
    if (email) {
      void navigator.clipboard.writeText(email);
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

  function saveAnswers(answers: Application["answers"]) {
    patchLocal({ answers });
    startTransition(async () => {
      await updateApplicationAnswers(app.id, answers);
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
      <div className="mx-auto max-w-[1080px] px-4 pb-14 pt-5 sm:px-6 lg:px-8">
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

        {app.archived_at ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E5EA] bg-[#F5F7FA] px-4 py-3">
            <div>
              <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
                Archived
              </div>
              <p className="mt-1 text-[13px] text-[#3a4350]">
                Hidden from your active list and insights. Restore to track it again.
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={handleRestore}
              className="cursor-pointer rounded-[9px] border border-[#CFE0FF] bg-[#EAF1FF] px-3 py-2 text-[12.5px] font-semibold text-[#2456D6] transition-colors hover:border-[#A8C4FF] disabled:opacity-50"
            >
              Restore
            </button>
          </div>
        ) : null}

        <div className="mb-5 flex flex-wrap items-start gap-3">
          <Link
            href="/applications"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E2E5EA] bg-white text-[17px] text-[#3a4350] transition-colors hover:border-accent hover:text-accent"
            aria-label="Back to applications"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink sm:text-[21px]">
                {title}
              </h1>
              <span
                className="inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold"
                style={{
                  background: statusMeta.bg,
                  color: statusMeta.fg,
                  borderColor: statusMeta.bd,
                }}
              >
                {statusMeta.label}
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted">
              Applied {formatAppDate(app.applied_at)}
              {app.resume_version_name ? ` · ${app.resume_version_name}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {app.archived_at ? (
              <button
                type="button"
                disabled={pending}
                onClick={handleDelete}
                className="cursor-pointer rounded-[9px] border border-[#E0E3E8] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#B23B3B] transition-colors hover:border-[#E0A0A0] hover:bg-[#FFF6F6] disabled:opacity-50"
              >
                Delete permanently
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleArchive}
                  className="cursor-pointer rounded-[9px] border border-[#E0E3E8] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5A6573] transition-colors hover:border-[#C8CED6] hover:text-ink disabled:opacity-50"
                >
                  Archive
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleDelete}
                  className="cursor-pointer rounded-[9px] border border-[#E0E3E8] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#B23B3B] transition-colors hover:border-[#E0A0A0] hover:bg-[#FFF6F6] disabled:opacity-50"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mb-5 grid gap-2 sm:grid-cols-3">
          {DETAIL_TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`cursor-pointer rounded-xl border px-3.5 py-3 text-left transition-all ${
                  active
                    ? "border-accent/30 bg-white shadow-[0_2px_12px_rgba(36,86,214,0.08)]"
                    : "border-transparent bg-[#ECEEF1]/70 hover:border-[#E2E5EA] hover:bg-white"
                }`}
              >
                <div
                  className={`text-[13px] font-semibold ${
                    active ? "text-accent" : "text-ink"
                  }`}
                >
                  {item.label}
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted">{item.hint}</div>
              </button>
            );
          })}
        </div>

        {mockMode && (
          <div className={`mb-4 ${mockBannerClass}`}>
            Demo AI mode — add ANTHROPIC_API_KEY for production output.
          </div>
        )}


        <ApplicationDetailPanels
          tab={tab}
          app={app}
          pending={pending}
          sortedEvents={sortedEvents}
          fitStyle={fitStyle}
          snapHtml={snapHtml}
          resumeVersions={resumeVersions}
          savedCoverLetters={savedCoverLetters}
          insightBusy={insightBusy}
          insightError={insightError}
          prepBusy={prepBusy}
          prepError={prepError}
          debriefBusy={debriefBusy}
          debriefError={debriefError}
          debriefFocus={debriefFocus}
          onDebriefFocusChange={setDebriefFocus}
          contactsBusy={contactsBusy}
          contactsError={contactsError}
          patchLocal={patchLocal}
          saveMeta={saveMeta}
          setStatus={setStatus}
          saveCoverLetter={saveCoverLetter}
          saveAnswers={saveAnswers}
          copyCover={copyCover}
          exportResume={exportResume}
          exportCover={exportCover}
          setPreviewOpen={setPreviewOpen}
          handleAnalyze={handleAnalyze}
          handleGenPrep={handleGenPrep}
          handleAnalyzeDebrief={handleAnalyzeDebrief}
          saveInterviewTranscript={saveInterviewTranscript}
          copyFollowUpEmail={copyFollowUpEmail}
          handleFindContacts={handleFindContacts}
          startTransition={startTransition}
          router={router}
          followUpRecommendations={followUpRecommendations}
          showFollowUpLesson={isStudent}
          onFollowUpEventAdded={() => undefined}
          onFollowUpDismissed={handleFollowUpDismissed}
        />
      </div>

      <ResumePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`${app.resume_version_name ?? "Resume"} · ${templateLabel(app.resume_snapshot.template_style)}`}
        html={snapHtml}
        onExport={exportResume}
      />

      <ConfirmDialog
        open={confirmKind !== null}
        title={
          confirmKind === "delete"
            ? "Delete this application?"
            : "Archive this application?"
        }
        description={
          confirmKind === "delete"
            ? app.archived_at
              ? "This archived application and its snapshot are permanently deleted. This cannot be undone."
              : "This application and its snapshot are permanently deleted. This cannot be undone."
            : "It moves out of your active list and insights — the snapshot is preserved and you can restore it anytime."
        }
        confirmLabel={confirmKind === "delete" ? "Delete" : "Archive"}
        danger={confirmKind === "delete"}
        pending={pending}
        onConfirm={handleConfirmedAction}
        onCancel={() => setConfirmKind(null)}
      />
    </div>
  );
}
