"use client";

import { AccentColorPicker } from "@/components/editor/accent-color-picker";
import { FitResumePreview } from "@/components/resume/fit-resume-preview";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { updateResumeVersion } from "@/lib/resume/actions";
import type { ResumeVersion } from "@/lib/resume/db-types";
import type {
  ResumeData,
  ResumeEducation,
  ResumeExperience,
  TemplateStyle,
} from "@/lib/types/resume";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TEMPLATES: { id: TemplateStyle; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "twocol", label: "Two-Column" },
  { id: "editorial", label: "Editorial" },
];

type ResumeEditorProps = {
  version: ResumeVersion;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3.5 font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8A92A0]">
      {children}
    </div>
  );
}

function FieldLabel({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-[5px] text-xs font-semibold text-[#5A6573] ${className}`}
    >
      {label}
      {children}
    </label>
  );
}

const inputClass =
  "rounded-[9px] border border-[#DFE3E8] px-[11px] py-[9px] text-sm text-ink focus:border-accent focus:outline-none";

function AutoTextarea({
  value,
  onChange,
  className = "",
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`resize-none overflow-hidden ${className}`}
    />
  );
}

export function ResumeEditor({ version }: ResumeEditorProps) {
  const [name, setName] = useState(version.name);
  const [templateStyle, setTemplateStyle] = useState(version.template_style);
  const [data, setData] = useState<ResumeData>(version.data);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [editorOpen, setEditorOpen] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ name, templateStyle, data });

  useEffect(() => {
    latestRef.current = { name, templateStyle, data };
  }, [name, templateStyle, data]);

  const previewHtml = useMemo(
    () => buildResumeHTML({ templateStyle, data }, false),
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

  function updateData(patch: Partial<ResumeData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function updateExperience(index: number, patch: Partial<ResumeExperience>) {
    setData((prev) => {
      const experience = [...prev.experience];
      experience[index] = { ...experience[index], ...patch };
      return { ...prev, experience };
    });
  }

  function moveExperience(index: number, direction: -1 | 1) {
    setData((prev) => {
      const next = index + direction;
      if (next < 0 || next >= prev.experience.length) return prev;
      const experience = [...prev.experience];
      [experience[index], experience[next]] = [
        experience[next],
        experience[index],
      ];
      return { ...prev, experience };
    });
  }

  function exportPdf() {
    const html = buildResumeHTML({ templateStyle, data }, true);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-none items-center gap-3 border-b border-border bg-white px-6 py-3.5">
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
          onClick={() => setEditorOpen((open) => !open)}
          className={`cursor-pointer rounded-[10px] border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
            editorOpen
              ? "border-[#DFE3E8] bg-white text-[#5A6573] hover:border-[#C8CED6]"
              : "border-accent bg-[#EAF1FF] text-[#2456D6]"
          }`}
        >
          {editorOpen ? "Preview only" : "Show editor"}
        </button>
        <span className="text-xs text-[#9AA3AF]">
          {saveState === "saving"
            ? "Saving…"
            : saveState === "saved"
              ? "Saved"
              : saveState === "error"
                ? "Save failed"
                : ""}
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
        <FitResumePreview html={previewHtml} className="absolute inset-0" />

        <div
          className={`absolute bottom-4 left-4 top-4 z-10 flex w-[min(440px,calc(100%-2rem))] flex-col transition-all duration-300 ease-out ${
            editorOpen
              ? "translate-x-0 opacity-100"
              : "pointer-events-none -translate-x-[108%] opacity-0"
          }`}
        >
          <div className="scroll flex flex-1 flex-col overflow-auto rounded-2xl border border-white/70 bg-white/94 px-6 pb-14 pt-5 shadow-[0_22px_56px_rgba(15,17,22,0.2)] backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8A92A0]">
                Edit resume
              </span>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="cursor-pointer rounded-lg border-none bg-[#F2F3F5] px-2.5 py-1 text-[11.5px] font-semibold text-[#5A6573] hover:bg-[#E8EBEF]"
              >
                Hide
              </button>
            </div>
          <SectionTitle>Header</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Full name">
              <input
                className={inputClass}
                value={data.name}
                onChange={(e) => updateData({ name: e.target.value })}
              />
            </FieldLabel>
            <FieldLabel label="Phone">
              <input
                className={inputClass}
                value={data.phone}
                onChange={(e) => updateData({ phone: e.target.value })}
              />
            </FieldLabel>
            <FieldLabel label="Email">
              <input
                className={inputClass}
                value={data.email}
                onChange={(e) => updateData({ email: e.target.value })}
              />
            </FieldLabel>
            <FieldLabel label="Location">
              <input
                className={inputClass}
                value={data.location}
                onChange={(e) => updateData({ location: e.target.value })}
              />
            </FieldLabel>
          </div>
          <FieldLabel label="LinkedIn / website (optional)" className="mt-3">
            <input
              className={inputClass}
              placeholder="linkedin.com/in/…"
              value={data.linkedin}
              onChange={(e) => updateData({ linkedin: e.target.value })}
            />
          </FieldLabel>
          <FieldLabel label="Headline" className="mt-3">
            <input
              className={inputClass}
              value={data.headline}
              onChange={(e) => updateData({ headline: e.target.value })}
            />
          </FieldLabel>

          <SectionTitle>Summary</SectionTitle>
          <textarea
            rows={4}
            className={`${inputClass} w-full resize-y leading-[1.55]`}
            value={data.summary}
            onChange={(e) => updateData({ summary: e.target.value })}
          />

          <div className="mb-3 mt-[26px] flex items-center justify-between">
            <SectionTitle>Skills</SectionTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, i) => (
              <span
                key={`${skill}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E9EE] bg-[#F2F4F7] px-2.5 py-1.5 text-[12.8px] text-[#2b3140]"
              >
                {skill}
                <button
                  type="button"
                  onClick={() =>
                    updateData({
                      skills: data.skills.filter((_, idx) => idx !== i),
                    })
                  }
                  className="cursor-pointer border-none bg-transparent p-0 text-[13px] leading-none text-[#9aa3af] hover:text-[#B23B3B]"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <input
            placeholder="Add a skill, press Enter"
            className="mt-2.5 w-full rounded-[9px] border border-dashed border-[#CFD5DD] bg-[#FAFBFC] px-[11px] py-[9px] text-[13.5px] text-ink focus:border-accent focus:border-solid focus:outline-none"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              const val = e.currentTarget.value.trim();
              if (!val) return;
              updateData({ skills: [...data.skills, val] });
              e.currentTarget.value = "";
            }}
          />

          <div className="mb-3 mt-7 flex items-center justify-between">
            <SectionTitle>Experience</SectionTitle>
            <button
              type="button"
              onClick={() =>
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
                })
              }
              className="cursor-pointer rounded-lg border-none bg-[#EAF1FF] px-[11px] py-1.5 text-[12.5px] font-semibold text-[#2456D6] hover:bg-[#dbe7ff]"
            >
              + Add role
            </button>
          </div>
          <div className="flex flex-col gap-3.5">
            {data.experience.map((exp, i) => (
              <div
                key={i}
                className="rounded-[13px] border border-border bg-[#FCFCFD] p-4"
              >
                <div className="mb-2.5 flex items-center gap-2">
                  <input
                    value={exp.company}
                    placeholder="Company"
                    onChange={(e) =>
                      updateExperience(i, { company: e.target.value })
                    }
                    className="flex-1 border-b border-[#E2E5EA] bg-transparent px-0.5 py-1 font-display text-[14.5px] font-bold text-ink focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => moveExperience(i, -1)}
                    className="h-7 w-7 cursor-pointer rounded-[7px] border-none bg-[#F2F3F5] text-xs text-[#5a6573]"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveExperience(i, 1)}
                    className="h-7 w-7 cursor-pointer rounded-[7px] border-none bg-[#F2F3F5] text-xs text-[#5a6573]"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateData({
                        experience: data.experience.filter((_, idx) => idx !== i),
                      })
                    }
                    className="h-7 w-7 cursor-pointer rounded-[7px] border-none bg-[#FFF4F4] text-xs text-[#B23B3B]"
                  >
                    ✕
                  </button>
                </div>
                <div className="mb-2 grid grid-cols-[1fr_130px] gap-2">
                  <input
                    value={exp.title}
                    placeholder="Title"
                    onChange={(e) =>
                      updateExperience(i, { title: e.target.value })
                    }
                    className="rounded-lg border border-[#E2E5EA] px-2 py-1.5 text-[13px] focus:border-accent focus:outline-none"
                  />
                  <input
                    value={exp.dates}
                    placeholder="2024 – Present"
                    onChange={(e) =>
                      updateExperience(i, { dates: e.target.value })
                    }
                    className="rounded-lg border border-[#E2E5EA] px-2 py-1.5 text-center text-[13px] focus:border-accent focus:outline-none"
                  />
                </div>
                <AutoTextarea
                  placeholder="One-line role summary (optional)"
                  value={exp.blurb ?? ""}
                  onChange={(value) => updateExperience(i, { blurb: value })}
                  className="mb-2 w-full rounded-lg border border-[#E2E5EA] px-2.5 py-2 text-[12.8px] leading-normal focus:border-accent focus:outline-none"
                />
                <div className="flex flex-col gap-1.5">
                  {exp.bullets.map((bullet, j) => (
                    <div key={j} className="flex items-start gap-1.5">
                      <span className="flex-none pt-[7px] text-[15px] leading-none text-accent">
                        •
                      </span>
                      <AutoTextarea
                        value={bullet}
                        onChange={(value) => {
                          const bullets = [...exp.bullets];
                          bullets[j] = value;
                          updateExperience(i, { bullets });
                        }}
                        className="min-h-[34px] flex-1 rounded-[7px] border border-[#EAEDF1] px-2 py-1.5 text-[12.8px] leading-[1.45] focus:border-accent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateExperience(i, {
                            bullets: exp.bullets.filter((_, idx) => idx !== j),
                          })
                        }
                        className="cursor-pointer border-none bg-transparent px-0.5 py-1.5 text-[13px] text-[#b9bfc8] hover:text-[#B23B3B]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      updateExperience(i, { bullets: [...exp.bullets, ""] })
                    }
                    className="cursor-pointer self-start border-none bg-transparent px-0 py-0.5 text-[12.3px] font-semibold text-[#2456D6]"
                  >
                    + Add bullet
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-3 mt-7 flex items-center justify-between">
            <SectionTitle>Education</SectionTitle>
            <button
              type="button"
              onClick={() =>
                updateData({
                  education: [
                    ...data.education,
                    { school: "", degree: "", year: "" },
                  ],
                })
              }
              className="cursor-pointer rounded-lg border-none bg-[#EAF1FF] px-[11px] py-1.5 text-[12.5px] font-semibold text-[#2456D6] hover:bg-[#dbe7ff]"
            >
              + Add
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {data.education.map((ed: ResumeEducation, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_90px_32px] items-center gap-2"
              >
                <input
                  value={ed.school}
                  placeholder="School"
                  onChange={(e) => {
                    const education = [...data.education];
                    education[i] = { ...education[i], school: e.target.value };
                    updateData({ education });
                  }}
                  className="rounded-lg border border-[#E2E5EA] px-2 py-1.5 text-[13px] focus:border-accent focus:outline-none"
                />
                <input
                  value={ed.degree}
                  placeholder="Degree"
                  onChange={(e) => {
                    const education = [...data.education];
                    education[i] = { ...education[i], degree: e.target.value };
                    updateData({ education });
                  }}
                  className="rounded-lg border border-[#E2E5EA] px-2 py-1.5 text-[13px] focus:border-accent focus:outline-none"
                />
                <input
                  value={ed.year}
                  placeholder="Year"
                  onChange={(e) => {
                    const education = [...data.education];
                    education[i] = { ...education[i], year: e.target.value };
                    updateData({ education });
                  }}
                  className="rounded-lg border border-[#E2E5EA] px-2 py-1.5 text-center text-[13px] focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateData({
                      education: data.education.filter((_, idx) => idx !== i),
                    })
                  }
                  className="h-[34px] cursor-pointer rounded-[7px] border-none bg-[#FFF4F4] text-xs text-[#B23B3B]"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          </div>
        </div>

        {!editorOpen ? (
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="absolute left-4 top-4 z-10 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/70 bg-white/94 px-4 py-2.5 text-[13px] font-semibold text-ink shadow-[0_10px_28px_rgba(15,17,22,0.16)] backdrop-blur-md transition-colors hover:bg-white"
          >
            ✎ Edit resume
          </button>
        ) : null}
      </div>
    </div>
  );
}
