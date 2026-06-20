"use client";

import { AccentColorPicker } from "@/components/editor/accent-color-picker";
import {
  dismissEditorClickHint,
  EditorClickHint,
  isEditorClickHintDismissed,
} from "@/components/editor/editor-click-hint";
import { SectionEditPanel } from "@/components/editor/section-edit-panel";
import { InteractiveResumePreview } from "@/components/resume/interactive-resume-preview";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { normalizeResumeData } from "@/lib/resume/defaults";
import { updateResumeVersion } from "@/lib/resume/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import type {
  ResumeData,
  ResumeExperience,
  TemplateStyle,
} from "@/lib/types/resume";
import type { ResumeEditSection } from "@/lib/types/resume-editor";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TEMPLATES: {
  id: TemplateStyle;
  label: string;
  atsRecommended?: boolean;
}[] = [
  { id: "classic", label: "Classic", atsRecommended: true },
  { id: "twocol", label: "Two-Column" },
  { id: "editorial", label: "Editorial" },
];

const SHORTEN_TARGET_PAGES = 2;

type ResumeEditorProps = {
  version: ResumeVersion;
};

export function ResumeEditor({ version }: ResumeEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(version.name);
  const [templateStyle, setTemplateStyle] = useState(version.template_style);
  const [data, setData] = useState<ResumeData>(version.data);
  const [activeSection, setActiveSection] = useState<ResumeEditSection>({
    id: "header",
  });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [showClickHint, setShowClickHint] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [shortening, setShortening] = useState(false);
  const [shortenError, setShortenError] = useState("");
  const [shortenUndo, setShortenUndo] = useState<ResumeData | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ name, templateStyle, data });

  useEffect(() => {
    setShowClickHint(!isEditorClickHintDismissed());
  }, []);

  useEffect(() => {
    latestRef.current = { name, templateStyle, data };
  }, [name, templateStyle, data]);

  const previewHtml = useMemo(
    () => buildResumeHTML({ templateStyle, data }, { interactive: true }),
    [templateStyle, data]
  );

  const persist = useCallback(() => {
    const payload = latestRef.current;
    setSaveState("saving");
    updateResumeVersion(version.id, {
      name: payload.name.trim() || version.name,
      template_style: payload.templateStyle,
      data: payload.data,
    })
      .then(() => {
        setSaveState("saved");
        router.refresh();
      })
      .catch(() => setSaveState("error"));
  }, [version.id, version.name, router]);

  function flushSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    persist();
  }

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("idle");
    saveTimer.current = setTimeout(persist, 900);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [name, templateStyle, data, persist]);

  const updateData = useCallback((patch: Partial<ResumeData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateExperience = useCallback(
    (index: number, patch: Partial<ResumeExperience>) => {
      setData((prev) => {
        const experience = [...prev.experience];
        experience[index] = { ...experience[index], ...patch };
        return { ...prev, experience };
      });
    },
    []
  );

  const updateActivity = useCallback(
    (index: number, patch: Partial<ResumeExperience>) => {
      setData((prev) => {
        const activities = [...(prev.activities ?? [])];
        activities[index] = { ...activities[index], ...patch };
        return { ...prev, activities };
      });
    },
    []
  );

  const handleSectionSelect = useCallback((section: ResumeEditSection) => {
    setActiveSection(section);
    if (showClickHint) {
      dismissEditorClickHint();
      setShowClickHint(false);
    }
  }, [showClickHint]);

  function dismissClickHint() {
    dismissEditorClickHint();
    setShowClickHint(false);
  }

  async function handleShortenToTwoPages() {
    setShortening(true);
    setShortenError("");
    try {
      const res = await fetch("/api/ai/resume-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "shorten-to-pages",
          data,
          targetPages: SHORTEN_TARGET_PAGES,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Shorten failed");
      setShortenUndo(data);
      setData(normalizeResumeData(json.data));
    } catch (err) {
      setShortenError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setShortening(false);
    }
  }

  function undoShorten() {
    if (!shortenUndo) return;
    setData(shortenUndo);
    setShortenUndo(null);
  }

  function openResumeWindow(forPrint: boolean) {
    const html = buildResumeHTML({ templateStyle, data }, { forPrint });
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  function exportPdf() {
    openResumeWindow(true);
  }

  function previewPdf() {
    openResumeWindow(false);
  }

  function addExperienceRole() {
    updateData({
      experience: [
        {
          company: "",
          title: "",
          dates: "",
          blurb: "",
          bullets: [""],
        },
        ...data.experience,
      ],
    });
    setActiveSection({ id: "experience", index: 0 });
  }

  function addActivity() {
    updateData({
      activities: [
        { company: "", title: "", dates: "", blurb: "", bullets: [""] },
        ...(data.activities ?? []),
      ],
    });
    setActiveSection({ id: "activities", index: 0 });
  }

  const coverLetterHref = `/cover?v=${version.id}`;
  const hasJobContext = Boolean(
    version.tailored_for?.role?.trim() ||
      version.tailored_for?.company?.trim() ||
      version.name.includes(" · ")
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-none flex-wrap items-center gap-3 border-b border-border bg-white px-6 py-3.5">
        <Link
          href="/library"
          className="text-[13px] font-semibold text-muted transition-colors hover:text-accent"
        >
          ← Library
        </Link>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={flushSave}
          placeholder="Resume name"
          aria-label="Resume name"
          className="min-w-[120px] max-w-[280px] flex-1 rounded-lg border border-[#E2E5EA] bg-[#FAFBFC] px-2.5 py-1.5 font-display text-[17px] font-semibold tracking-[-0.01em] text-ink transition-colors focus:border-accent focus:bg-white focus:outline-none"
        />
        <div className="flex flex-col gap-1">
          <div className="flex rounded-[10px] bg-[#F2F3F5] p-1">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setTemplateStyle(tpl.id)}
                className={`cursor-pointer rounded-lg px-3 py-[7px] text-[12.5px] font-semibold transition-all ${
                  templateStyle === tpl.id
                    ? "bg-white text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                    : "bg-transparent text-[#7A828F]"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {tpl.label}
                  {tpl.atsRecommended ? (
                    <span className="rounded-full bg-[#E6F7EE] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0E7C4B]">
                      ATS
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
          {templateStyle !== "classic" ? (
            <p className="max-w-[280px] text-[11px] leading-snug text-[#8A92A0]">
              Multi-column layouts may parse less reliably in some ATS — use{" "}
              <button
                type="button"
                onClick={() => setTemplateStyle("classic")}
                className="cursor-pointer font-semibold text-[#2456D6] hover:underline"
              >
                Classic
              </button>{" "}
              for automated applications.
            </p>
          ) : null}
        </div>
        <AccentColorPicker
          value={data.accentColor}
          onChange={(accentColor) => updateData({ accentColor })}
        />
        <button
          type="button"
          onClick={addExperienceRole}
          className="cursor-pointer rounded-[10px] border border-[#DFE3E8] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5A6573] hover:border-[#C8CED6]"
        >
          + Role
        </button>
        <button
          type="button"
          onClick={addActivity}
          className="cursor-pointer rounded-[10px] border border-[#DFE3E8] bg-white px-3 py-2 text-[12.5px] font-semibold text-[#5A6573] hover:border-[#C8CED6]"
        >
          + Activity
        </button>
        <span className="hidden text-xs text-[#9AA3AF] lg:inline">
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Saved"
              : saveState === "error"
                ? "Save failed"
                : "Live preview"}
        </span>
        <Link
          href={coverLetterHref}
          className={`inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors ${
            hasJobContext
              ? "border border-[#CFE0FF] bg-[#EAF1FF] text-[#1E54E6] hover:border-[#A8C4FF] hover:bg-[#DCE8FF]"
              : "border border-[#DFE3E8] bg-white text-[#5A6573] hover:border-[#C8CED6] hover:text-ink"
          }`}
        >
          ✉ Cover letter
        </Link>
        <button
          type="button"
          disabled={shortening || pageCount <= SHORTEN_TARGET_PAGES}
          onClick={handleShortenToTwoPages}
          title={
            pageCount <= SHORTEN_TARGET_PAGES
              ? `Resume already fits on ${pageCount} page${pageCount === 1 ? "" : "s"}`
              : `AI compresses content to fit ${SHORTEN_TARGET_PAGES} pages`
          }
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#DFE3E8] bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-[#5A6573] transition-colors hover:border-[#C8CED6] hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {shortening ? "Shortening…" : `Shorten to ${SHORTEN_TARGET_PAGES} pages`}
        </button>
        <button
          type="button"
          onClick={previewPdf}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#DFE3E8] bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-[#5A6573] transition-colors hover:border-[#C8CED6] hover:text-ink"
        >
          ⤢ Preview PDF
        </button>
        <button
          type="button"
          onClick={exportPdf}
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_4px_12px_rgba(47,107,255,0.3)] transition-colors hover:bg-[#1E54E6]"
        >
          ↓ Export PDF
        </button>
      </div>

      {shortenError ? (
        <div className="flex-none border-b border-[#F5C4C4] bg-[#FFF4F4] px-6 py-2 text-[13px] text-[#B23B3B]">
          {shortenError}
        </div>
      ) : null}

      {shortenUndo ? (
        <div className="flex flex-none items-center justify-between gap-3 border-b border-[#C8D8FF] bg-[#F0F5FF] px-6 py-2.5 text-[13px] text-[#3a4250]">
          <span>Resume shortened — review the preview, then save or undo.</span>
          <button
            type="button"
            onClick={undoShorten}
            className="cursor-pointer rounded-[8px] border border-[#C8D8FF] bg-white px-3 py-1 text-[12.5px] font-semibold text-[#2456D6] hover:bg-[#F5F8FF]"
          >
            Undo shorten
          </button>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <div className="relative min-h-0 min-w-0 flex-1">
          <InteractiveResumePreview
            html={previewHtml}
            activeSection={activeSection}
            onSectionSelect={handleSectionSelect}
            onPageCountChange={setPageCount}
            className="h-full"
          />
          {showClickHint ? (
            <EditorClickHint onDismiss={dismissClickHint} />
          ) : null}
        </div>

        <SectionEditPanel
          section={activeSection}
          data={data}
          onSectionChange={setActiveSection}
          onUpdateData={updateData}
          onUpdateExperience={updateExperience}
          onUpdateActivity={updateActivity}
        />
      </div>
    </div>
  );
}
