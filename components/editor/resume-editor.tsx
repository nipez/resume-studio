"use client";

import { AccentColorPicker } from "@/components/editor/accent-color-picker";
import { SectionEditPanel } from "@/components/editor/section-edit-panel";
import { InteractiveResumePreview } from "@/components/resume/interactive-resume-preview";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { updateResumeVersion } from "@/lib/resume/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import type {
  ResumeData,
  ResumeExperience,
  TemplateStyle,
} from "@/lib/types/resume";
import type { ResumeEditSection } from "@/lib/types/resume-editor";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TEMPLATES: { id: TemplateStyle; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "twocol", label: "Two-Column" },
  { id: "editorial", label: "Editorial" },
];

const PANEL_WIDTH = 400;
const PANEL_GUTTER = 32;

type ResumeEditorProps = {
  version: ResumeVersion;
};

export function ResumeEditor({ version }: ResumeEditorProps) {
  const [name, setName] = useState(version.name);
  const [templateStyle, setTemplateStyle] = useState(version.template_style);
  const [data, setData] = useState<ResumeData>(version.data);
  const [activeSection, setActiveSection] = useState<ResumeEditSection | null>({
    id: "header",
  });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ name, templateStyle, data });

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
      name: payload.name,
      template_style: payload.templateStyle,
      data: payload.data,
    })
      .then(() => setSaveState("saved"))
      .catch(() => setSaveState("error"));
  }, [version.id]);

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

  const handleSectionSelect = useCallback((section: ResumeEditSection) => {
    setActiveSection(section);
  }, []);

  function exportPdf() {
    const html = buildResumeHTML({ templateStyle, data }, { forPrint: true });
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
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
          className="min-w-0 flex-1 border-none bg-transparent font-display text-[17px] font-semibold tracking-[-0.01em] text-ink focus:outline-none"
        />
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
              {tpl.label}
            </button>
          ))}
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
        <span className="hidden text-xs text-[#9AA3AF] lg:inline">
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Saved"
              : saveState === "error"
                ? "Save failed"
                : "Click a section to switch"}
        </span>
        <button
          type="button"
          onClick={exportPdf}
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_4px_12px_rgba(47,107,255,0.3)] transition-colors hover:bg-[#1E54E6]"
        >
          ↓ Export PDF
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <InteractiveResumePreview
          html={previewHtml}
          activeSection={activeSection}
          onSectionSelect={handleSectionSelect}
          reservedRight={activeSection ? PANEL_WIDTH + PANEL_GUTTER : 0}
          className="absolute inset-0"
        />

        {!activeSection ? (
          <div className="pointer-events-none absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/70 bg-white/92 px-4 py-2 text-[12.5px] font-medium text-[#5A6573] shadow-[0_8px_24px_rgba(15,17,22,0.12)] backdrop-blur-md">
            Click any highlighted section on your resume to edit · AI assist in
            each panel
          </div>
        ) : null}

        {activeSection ? (
          <SectionEditPanel
            section={activeSection}
            data={data}
            onUpdateData={updateData}
            onUpdateExperience={updateExperience}
            onClose={() => setActiveSection(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
