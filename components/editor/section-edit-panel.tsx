"use client";

import { ResumeAiAssist } from "@/components/editor/resume-ai-assist";
import type {
  ResumeData,
  ResumeEducation,
  ResumeExperience,
} from "@/lib/types/resume";
import type { ResumeEditSection } from "@/lib/types/resume-editor";
import { sectionLabel } from "@/lib/types/resume-editor";
import { useCallback, useEffect, useRef } from "react";

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

type SectionEditPanelProps = {
  section: ResumeEditSection;
  data: ResumeData;
  onUpdateData: (patch: Partial<ResumeData>) => void;
  onUpdateExperience: (index: number, patch: Partial<ResumeExperience>) => void;
  onClose: () => void;
};

export function SectionEditPanel({
  section,
  data,
  onUpdateData,
  onUpdateExperience,
  onClose,
}: SectionEditPanelProps) {
  const expIndex = section.index ?? 0;
  const exp = data.experience[expIndex];

  return (
    <div className="absolute bottom-4 right-4 top-4 z-20 flex w-[min(400px,calc(100%-2rem))] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/96 shadow-[0_22px_56px_rgba(15,17,22,0.22)] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-[#EEF1F4] px-5 py-4">
        <div>
          <div className="font-display text-[15px] font-semibold text-ink">
            {sectionLabel(section)}
          </div>
          <div className="mt-0.5 text-[12px] text-[#8A92A0]">
            Changes update live on your resume
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg border-none bg-[#F2F3F5] px-2.5 py-1 text-[11.5px] font-semibold text-[#5A6573] hover:bg-[#E8EBEF]"
        >
          Close
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-none border-b border-[#EEF1F4] px-5 py-4">
          <ResumeAiAssist
            section={section}
            data={data}
            onApplySummary={(summary) => onUpdateData({ summary })}
            onApplyHeadline={(headline) => onUpdateData({ headline })}
            onApplySkills={(skills) => onUpdateData({ skills })}
            onApplyBullets={(index, blurb, bullets) =>
              onUpdateExperience(index, { blurb, bullets })
            }
          />
        </div>

        <div className="scroll min-h-0 flex-1 overflow-auto px-5 py-4">
          <div className="mb-3 font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A92A0]">
            Edit fields
          </div>

        {section.id === "header" ? (
          <div className="space-y-3">
            <Field label="Full name">
              <input
                className={`${inputClass} w-full`}
                value={data.name}
                onChange={(e) => onUpdateData({ name: e.target.value })}
              />
            </Field>
            <Field label="Headline">
              <input
                className={`${inputClass} w-full`}
                value={data.headline}
                onChange={(e) => onUpdateData({ headline: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <input
                  className={inputClass}
                  value={data.phone}
                  onChange={(e) => onUpdateData({ phone: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <input
                  className={inputClass}
                  value={data.email}
                  onChange={(e) => onUpdateData({ email: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Location">
              <input
                className={`${inputClass} w-full`}
                value={data.location}
                onChange={(e) => onUpdateData({ location: e.target.value })}
              />
            </Field>
            <Field label="LinkedIn / website">
              <input
                className={`${inputClass} w-full`}
                value={data.linkedin}
                onChange={(e) => onUpdateData({ linkedin: e.target.value })}
              />
            </Field>
          </div>
        ) : null}

        {section.id === "summary" ? (
          <Field label="Summary / profile">
            <textarea
              rows={6}
              className={`${inputClass} w-full resize-y leading-[1.55]`}
              value={data.summary}
              onChange={(e) => onUpdateData({ summary: e.target.value })}
            />
          </Field>
        ) : null}

        {section.id === "skills" ? (
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {data.skills.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E9EE] bg-[#F2F4F7] px-2.5 py-1.5 text-[12.8px]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateData({
                        skills: data.skills.filter((_, idx) => idx !== i),
                      })
                    }
                    className="cursor-pointer border-none bg-transparent p-0 text-[#9aa3af] hover:text-[#B23B3B]"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <input
              placeholder="Add skill, press Enter"
              className="w-full rounded-[9px] border border-dashed border-[#CFD5DD] bg-[#FAFBFC] px-[11px] py-[9px] text-[13.5px] focus:border-accent focus:border-solid focus:outline-none"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const val = e.currentTarget.value.trim();
                if (!val) return;
                onUpdateData({ skills: [...data.skills, val] });
                e.currentTarget.value = "";
              }}
            />
          </div>
        ) : null}

        {section.id === "experience" && exp ? (
          <div className="space-y-3">
            <Field label="Company">
              <input
                className={`${inputClass} w-full`}
                value={exp.company}
                onChange={(e) =>
                  onUpdateExperience(expIndex, { company: e.target.value })
                }
              />
            </Field>
            <div className="grid grid-cols-[1fr_120px] gap-2">
              <Field label="Title">
                <input
                  className={inputClass}
                  value={exp.title}
                  onChange={(e) =>
                    onUpdateExperience(expIndex, { title: e.target.value })
                  }
                />
              </Field>
              <Field label="Dates">
                <input
                  className={inputClass}
                  value={exp.dates}
                  onChange={(e) =>
                    onUpdateExperience(expIndex, { dates: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Role summary">
              <AutoTextarea
                value={exp.blurb ?? ""}
                onChange={(value) => onUpdateExperience(expIndex, { blurb: value })}
                className={`${inputClass} w-full text-[12.8px]`}
              />
            </Field>
            <div className="space-y-1.5">
              {exp.bullets.map((bullet, j) => (
                <div key={j} className="flex items-start gap-1.5">
                  <span className="flex-none pt-[7px] text-accent">•</span>
                  <AutoTextarea
                    value={bullet}
                    onChange={(value) => {
                      const bullets = [...exp.bullets];
                      bullets[j] = value;
                      onUpdateExperience(expIndex, { bullets });
                    }}
                    className={`${inputClass} min-h-[34px] flex-1 text-[12.8px]`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateExperience(expIndex, {
                        bullets: exp.bullets.filter((_, idx) => idx !== j),
                      })
                    }
                    className="cursor-pointer border-none bg-transparent text-[#b9bfc8] hover:text-[#B23B3B]"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  onUpdateExperience(expIndex, {
                    bullets: [...exp.bullets, ""],
                  })
                }
                className="cursor-pointer border-none bg-transparent text-[12.3px] font-semibold text-[#2456D6]"
              >
                + Add bullet
              </button>
            </div>
          </div>
        ) : null}

        {section.id === "education" ? (
          <div className="space-y-2">
            {data.education.map((ed: ResumeEducation, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_72px_28px] items-center gap-2"
              >
                <input
                  value={ed.school}
                  placeholder="School"
                  onChange={(e) => {
                    const education = [...data.education];
                    education[i] = { ...education[i], school: e.target.value };
                    onUpdateData({ education });
                  }}
                  className="rounded-lg border border-[#E2E5EA] px-2 py-1.5 text-[13px] focus:border-accent focus:outline-none"
                />
                <input
                  value={ed.degree}
                  placeholder="Degree"
                  onChange={(e) => {
                    const education = [...data.education];
                    education[i] = { ...education[i], degree: e.target.value };
                    onUpdateData({ education });
                  }}
                  className="rounded-lg border border-[#E2E5EA] px-2 py-1.5 text-[13px] focus:border-accent focus:outline-none"
                />
                <input
                  value={ed.year}
                  placeholder="Year"
                  onChange={(e) => {
                    const education = [...data.education];
                    education[i] = { ...education[i], year: e.target.value };
                    onUpdateData({ education });
                  }}
                  className="rounded-lg border border-[#E2E5EA] px-2 py-1.5 text-center text-[13px] focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateData({
                      education: data.education.filter((_, idx) => idx !== i),
                    })
                  }
                  className="cursor-pointer rounded-[7px] border-none bg-[#FFF4F4] text-xs text-[#B23B3B]"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onUpdateData({
                  education: [
                    ...data.education,
                    { school: "", degree: "", year: "" },
                  ],
                })
              }
              className="cursor-pointer rounded-lg border-none bg-[#EAF1FF] px-[11px] py-1.5 text-[12.5px] font-semibold text-[#2456D6]"
            >
              + Add education
            </button>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-[5px] text-xs font-semibold text-[#5A6573]">
      {label}
      {children}
    </label>
  );
}
