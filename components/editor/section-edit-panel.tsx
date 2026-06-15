"use client";

import { ResumeAiAssist, type AiApplyPatch, type AiUndoSnapshot } from "@/components/editor/resume-ai-assist";
import type {
  ResumeData,
  ResumeEducation,
  ResumeExperience,
} from "@/lib/types/resume";
import type {
  ResumeEditSection,
  ResumeEditSectionId,
} from "@/lib/types/resume-editor";
import { sectionLabel } from "@/lib/types/resume-editor";
import { useCallback, useEffect, useRef } from "react";

const inputClass =
  "rounded-[9px] border border-[#DFE3E8] px-[11px] py-[9px] text-sm text-ink focus:border-accent focus:outline-none";

const SECTION_TABS: { id: ResumeEditSectionId; label: string }[] = [
  { id: "header", label: "Header" },
  { id: "summary", label: "Summary" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
];

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
  onSectionChange: (section: ResumeEditSection) => void;
  onUpdateData: (patch: Partial<ResumeData>) => void;
  onUpdateExperience: (index: number, patch: Partial<ResumeExperience>) => void;
};

export function SectionEditPanel({
  section,
  data,
  onSectionChange,
  onUpdateData,
  onUpdateExperience,
}: SectionEditPanelProps) {
  const expIndex = section.index ?? 0;
  const exp = data.experience[expIndex];

  function applyAiPatch(patch: AiApplyPatch) {
    const updates: Partial<ResumeData> = {};
    if (patch.headline) updates.headline = patch.headline;
    if (patch.summary) updates.summary = patch.summary;
    if (patch.skills) updates.skills = patch.skills;
    if (Object.keys(updates).length) onUpdateData(updates);

    if (
      patch.experience &&
      patch.experience.index !== undefined &&
      data.experience[patch.experience.index]
    ) {
      onUpdateExperience(patch.experience.index, {
        ...(patch.experience.blurb !== undefined
          ? { blurb: patch.experience.blurb }
          : {}),
        ...(patch.experience.bullets
          ? { bullets: patch.experience.bullets }
          : {}),
      });
    }
  }

  function restoreUndo(snapshot: AiUndoSnapshot) {
    const updates: Partial<ResumeData> = {};
    if (snapshot.headline !== undefined) updates.headline = snapshot.headline;
    if (snapshot.summary !== undefined) updates.summary = snapshot.summary;
    if (snapshot.skills !== undefined) updates.skills = snapshot.skills;
    if (Object.keys(updates).length) onUpdateData(updates);

    if (snapshot.experience) {
      onUpdateExperience(snapshot.experience.index, {
        ...(snapshot.experience.blurb !== undefined
          ? { blurb: snapshot.experience.blurb }
          : {}),
        ...(snapshot.experience.bullets
          ? { bullets: snapshot.experience.bullets }
          : {}),
      });
    }
  }

  function selectTab(id: ResumeEditSectionId) {
    if (id === "experience") {
      onSectionChange({ id: "experience", index: 0 });
      return;
    }
    onSectionChange({ id });
  }

  const isExperience = section.id === "experience";

  return (
    <aside className="flex h-full w-[400px] flex-none flex-col border-l border-border bg-white">
      <div className="flex-none border-b border-[#EEF1F4] px-4 py-3">
        <div className="font-display text-[15px] font-semibold text-ink">
          Edit resume
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SECTION_TABS.map((tab) => (
            <TabButton
              key={tab.id}
              active={section.id === tab.id}
              onClick={() => selectTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
          <TabButton
            active={isExperience}
            onClick={() => selectTab("experience")}
          >
            Experience
          </TabButton>
        </div>
      </div>

      <div className="scroll min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <h2 className="mb-4 font-display text-[14px] font-semibold text-ink">
          {sectionLabel(section)}
        </h2>

        {isExperience && data.experience.length > 1 ? (
          <label className="mb-4 flex flex-col gap-1.5 text-xs font-semibold text-[#5A6573]">
            Role
            <select
              value={expIndex}
              onChange={(e) =>
                onSectionChange({
                  id: "experience",
                  index: Number(e.target.value),
                })
              }
              className={inputClass}
            >
              {data.experience.map((role, i) => (
                <option key={i} value={i}>
                  {role.title || role.company || `Role ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
        ) : null}

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
              rows={8}
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

        {section.id === "experience" && !exp ? (
          <p className="text-[13px] leading-relaxed text-[#7A828F]">
            No roles yet. Use{" "}
            <span className="font-semibold text-ink">+ Role</span> in the toolbar,
            or click a job on the preview.
          </p>
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

        <ResumeAiAssist
          section={section}
          data={data}
          onApplySummary={(summary) => onUpdateData({ summary })}
          onApplyHeadline={(headline) => onUpdateData({ headline })}
          onApplySkills={(skills) => onUpdateData({ skills })}
          onApplyBullets={(index, blurb, bullets) =>
            onUpdateExperience(index, { blurb, bullets })
          }
          onApplyPatch={applyAiPatch}
          onRestoreUndo={restoreUndo}
        />
      </div>
    </aside>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-2.5 py-1 text-[12px] font-semibold transition-colors ${
        active
          ? "bg-[#EAF1FF] text-[#2456D6]"
          : "bg-[#F2F3F5] text-[#5A6573] hover:bg-[#E8EBEF]"
      }`}
    >
      {children}
    </button>
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
