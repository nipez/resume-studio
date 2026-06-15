"use client";

import { ScaledResumePreview } from "@/components/resume/resume-preview";
import {
  discardGuidedDraft,
  finishGuidedDraft,
  saveGuidedDraft,
  type GuidedDraft,
} from "@/lib/guided/actions";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { createEmptyResumeData } from "@/lib/resume/defaults";
import type {
  ResumeData,
  ResumeExperience,
  TemplateStyle,
} from "@/lib/types/resume";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STEPS = [
  { id: "basics", title: "The basics", subtitle: "Who you are and how to reach you." },
  { id: "summary", title: "Your summary", subtitle: "Two or three sentences. Don't overthink it." },
  { id: "experience", title: "Experience", subtitle: "Add the roles you want to feature." },
  { id: "skills", title: "Skills", subtitle: "List the skills you want to highlight." },
  { id: "education", title: "Education", subtitle: "Where you studied (optional)." },
  { id: "finish", title: "Review & create", subtitle: "Pick a look, then create your resume." },
] as const;

const TEMPLATES: { id: TemplateStyle; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "twocol", label: "Two-Column" },
  { id: "editorial", label: "Editorial" },
];

const inputClass =
  "w-full rounded-[10px] border border-[#DFE3E8] px-[12px] py-[10px] text-[14px] text-ink focus:border-accent focus:outline-none";

type GuidedBuilderProps = {
  initialDraft: GuidedDraft | null;
  userName: string;
  userEmail: string;
};

export function GuidedBuilder({
  initialDraft,
  userName,
  userEmail,
}: GuidedBuilderProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialDraft?.step ?? 0);
  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>(
    initialDraft?.templateStyle ?? "twocol"
  );
  const [makeDefault, setMakeDefault] = useState(initialDraft?.makeDefault ?? true);
  const [data, setData] = useState<ResumeData>(
    initialDraft?.data ?? createEmptyResumeData(userName, userEmail)
  );
  const [resumeName, setResumeName] = useState(
    data.name ? `${data.name.split(" ")[0]}'s Resume` : "My Resume"
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [creating, setCreating] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ step, templateStyle, makeDefault, data });
  useEffect(() => {
    latest.current = { step, templateStyle, makeDefault, data };
  }, [step, templateStyle, makeDefault, data]);

  // Debounced autosave so progress is resumable from guided_drafts.
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(() => {
      saveGuidedDraft(latest.current)
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("idle"));
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [step, templateStyle, makeDefault, data]);

  const previewHtml = useMemo(
    () => buildResumeHTML({ templateStyle, data }),
    [templateStyle, data]
  );

  function updateData(patch: Partial<ResumeData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

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

  function goNext() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const { id } = await finishGuidedDraft({
        name: resumeName,
        templateStyle,
        makeDefault,
        data,
      });
      router.push(`/editor/${id}`);
    } catch {
      setCreating(false);
    }
  }

  async function handleDiscard() {
    if (!confirm("Discard this guided draft? Your progress will be lost.")) return;
    await discardGuidedDraft();
    router.push("/library");
  }

  const current = STEPS[step];

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto flex max-w-[1120px] gap-8 px-10 pb-16 pt-[34px]">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/library"
              className="text-[13px] font-semibold text-muted transition-colors hover:text-accent"
            >
              ← Library
            </Link>
            <span className="text-xs text-[#9AA3AF]">
              {saveState === "saving"
                ? "Saving…"
                : saveState === "saved"
                  ? "Progress saved"
                  : ""}
            </span>
          </div>

          <div className="mb-5 flex flex-wrap gap-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(i)}
                className={`h-1.5 flex-1 min-w-[28px] cursor-pointer rounded-full border-none transition-colors ${
                  i <= step ? "bg-accent" : "bg-[#E4E7EC]"
                }`}
                title={s.title}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-white p-7">
            <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.07em] text-accent">
              Step {step + 1} of {STEPS.length}
            </div>
            <h1 className="font-display text-[24px] font-semibold tracking-[-0.02em] text-ink">
              {current.title}
            </h1>
            <p className="mt-1.5 text-[14px] text-muted">{current.subtitle}</p>

            <div className="mt-6">
              {current.id === "basics" ? (
                <div className="space-y-3">
                  <Field label="Full name">
                    <input
                      className={inputClass}
                      value={data.name}
                      placeholder="Jordan Rivera"
                      onChange={(e) => updateData({ name: e.target.value })}
                    />
                  </Field>
                  <Field label="Headline">
                    <input
                      className={inputClass}
                      value={data.headline}
                      placeholder="Marketing Manager · Growth & Brand"
                      onChange={(e) => updateData({ headline: e.target.value })}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Email">
                      <input
                        className={inputClass}
                        value={data.email}
                        onChange={(e) => updateData({ email: e.target.value })}
                      />
                    </Field>
                    <Field label="Phone">
                      <input
                        className={inputClass}
                        value={data.phone}
                        onChange={(e) => updateData({ phone: e.target.value })}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Location">
                      <input
                        className={inputClass}
                        value={data.location}
                        onChange={(e) => updateData({ location: e.target.value })}
                      />
                    </Field>
                    <Field label="LinkedIn / website">
                      <input
                        className={inputClass}
                        value={data.linkedin}
                        onChange={(e) => updateData({ linkedin: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              ) : null}

              {current.id === "summary" ? (
                <Field label="Summary">
                  <textarea
                    rows={6}
                    className={`${inputClass} resize-y leading-[1.55]`}
                    value={data.summary}
                    placeholder="What do you do, who for, and what are you known for? A couple of sentences is plenty."
                    onChange={(e) => updateData({ summary: e.target.value })}
                  />
                </Field>
              ) : null}

              {current.id === "experience" ? (
                <div className="space-y-4">
                  {data.experience.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-4 py-6 text-center text-[13px] text-muted">
                      No roles yet. Add your most recent job to start.
                    </p>
                  ) : null}
                  {data.experience.map((exp, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[#E6E9EE] bg-[#FCFCFD] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-muted">
                          Role {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateData({
                              experience: data.experience.filter(
                                (_, idx) => idx !== i
                              ),
                            })
                          }
                          className="cursor-pointer border-none bg-transparent text-[12px] text-[#B23B3B] hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className={inputClass}
                          value={exp.company}
                          placeholder="Company"
                          onChange={(e) =>
                            updateExperience(i, { company: e.target.value })
                          }
                        />
                        <input
                          className={inputClass}
                          value={exp.title}
                          placeholder="Title"
                          onChange={(e) =>
                            updateExperience(i, { title: e.target.value })
                          }
                        />
                      </div>
                      <input
                        className={`${inputClass} mt-2`}
                        value={exp.dates}
                        placeholder="2022 – Present"
                        onChange={(e) =>
                          updateExperience(i, { dates: e.target.value })
                        }
                      />
                      <div className="mt-2 space-y-1.5">
                        {exp.bullets.map((bullet, j) => (
                          <div key={j} className="flex items-start gap-1.5">
                            <span className="pt-[10px] text-accent">•</span>
                            <textarea
                              rows={2}
                              className={`${inputClass} resize-y text-[13px]`}
                              value={bullet}
                              placeholder="What did you accomplish? Start with an action verb."
                              onChange={(e) => {
                                const bullets = [...exp.bullets];
                                bullets[j] = e.target.value;
                                updateExperience(i, { bullets });
                              }}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateExperience(i, {
                                  bullets: exp.bullets.filter(
                                    (_, idx) => idx !== j
                                  ),
                                })
                              }
                              className="cursor-pointer border-none bg-transparent pt-[8px] text-[#b9bfc8] hover:text-[#B23B3B]"
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
                          className="cursor-pointer border-none bg-transparent text-[12.5px] font-semibold text-[#2456D6]"
                        >
                          + Add bullet
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      updateData({
                        experience: [
                          ...data.experience,
                          { company: "", title: "", dates: "", blurb: "", bullets: [""] },
                        ],
                      })
                    }
                    className="cursor-pointer rounded-[10px] border border-dashed border-[#CFD5DD] bg-[#FAFBFC] px-4 py-2.5 text-[13px] font-semibold text-[#2456D6] hover:border-accent"
                  >
                    + Add a role
                  </button>
                </div>
              ) : null}

              {current.id === "skills" ? (
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
                            updateData({
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
                    placeholder="Add a skill, press Enter"
                    className={inputClass}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (!val) return;
                      updateData({ skills: [...data.skills, val] });
                      e.currentTarget.value = "";
                    }}
                  />
                </div>
              ) : null}

              {current.id === "education" ? (
                <div className="space-y-2">
                  {data.education.map((ed, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_90px_28px] gap-2">
                      <input
                        className={inputClass}
                        value={ed.school}
                        placeholder="School"
                        onChange={(e) => {
                          const education = [...data.education];
                          education[i] = { ...education[i], school: e.target.value };
                          updateData({ education });
                        }}
                      />
                      <input
                        className={inputClass}
                        value={ed.degree}
                        placeholder="Degree"
                        onChange={(e) => {
                          const education = [...data.education];
                          education[i] = { ...education[i], degree: e.target.value };
                          updateData({ education });
                        }}
                      />
                      <input
                        className={inputClass}
                        value={ed.year}
                        placeholder="Year"
                        onChange={(e) => {
                          const education = [...data.education];
                          education[i] = { ...education[i], year: e.target.value };
                          updateData({ education });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateData({
                            education: data.education.filter((_, idx) => idx !== i),
                          })
                        }
                        className="cursor-pointer rounded-[8px] border-none bg-[#FFF4F4] text-xs text-[#B23B3B]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
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
                    className="cursor-pointer rounded-[10px] border border-dashed border-[#CFD5DD] bg-[#FAFBFC] px-4 py-2.5 text-[13px] font-semibold text-[#2456D6] hover:border-accent"
                  >
                    + Add education
                  </button>
                </div>
              ) : null}

              {current.id === "finish" ? (
                <div className="space-y-5">
                  <Field label="Name this resume">
                    <input
                      className={inputClass}
                      value={resumeName}
                      onChange={(e) => setResumeName(e.target.value)}
                    />
                  </Field>
                  <div>
                    <div className="mb-2 text-xs font-semibold text-[#5A6573]">
                      Template
                    </div>
                    <div className="flex gap-2">
                      {TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setTemplateStyle(tpl.id)}
                          className={`flex-1 cursor-pointer rounded-[10px] border px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                            templateStyle === tpl.id
                              ? "border-accent bg-[#EEF3FF] text-[#1E54E6]"
                              : "border-[#DFE3E8] bg-white text-[#5A6573] hover:border-[#C8CED6]"
                          }`}
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-[#3a4350]">
                    <input
                      type="checkbox"
                      checked={makeDefault}
                      onChange={(e) => setMakeDefault(e.target.checked)}
                      className="h-4 w-4 cursor-pointer accent-[#2F6BFF]"
                    />
                    Make this my default resume
                  </label>
                </div>
              ) : null}
            </div>

            <div className="mt-7 flex items-center justify-between border-t border-[#EEF0F3] pt-5">
              <div>
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="cursor-pointer rounded-[10px] border border-[#DFE3E8] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#5A6573] hover:border-[#C8CED6]"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="cursor-pointer border-none bg-transparent text-[13px] text-[#9AA3AF] hover:text-[#B23B3B]"
                  >
                    Discard draft
                  </button>
                )}
              </div>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="cursor-pointer rounded-[10px] border-none bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6]"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  disabled={creating}
                  onClick={handleCreate}
                  className="cursor-pointer rounded-[10px] border-none bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6] disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Create my resume"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="hidden flex-none lg:block">
          <div className="sticky top-[34px]">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A92A0]">
              Live preview
            </div>
            <ScaledResumePreview html={previewHtml} title="Resume preview" />
          </div>
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
