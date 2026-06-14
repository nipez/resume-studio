import { ScaledResumePreview } from "@/components/resume/resume-preview";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { STUDENT_SAMPLE_RESUME_DATA } from "@/lib/resume/student-sample-data";
import type { TemplateStyle } from "@/lib/types/resume";

const TEMPLATES: { style: TemplateStyle; label: string; note: string }[] = [
  {
    style: "classic",
    label: "Classic",
    note: "Clean and familiar — great for counselors and first applications.",
  },
  {
    style: "twocol",
    label: "Two-Column",
    note: "Skills and school on the left — fits lots of activities on one page.",
  },
  {
    style: "editorial",
    label: "Editorial",
    note: "Polished serif look — strong for college supplements and internships.",
  },
];

export function StudentTemplateGallery() {
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D97706]">
            Templates
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Three templates built for students
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Same professional layouts as the full workspace — previewed with
            real high-school sample data, not a fake executive resume.
          </p>
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-10 lg:justify-start">
          {TEMPLATES.map((template, i) => {
            const html = buildResumeHTML({
              templateStyle: template.style,
              data: STUDENT_SAMPLE_RESUME_DATA,
            });

            return (
              <div
                key={template.style}
                className={`flex max-w-[360px] flex-col items-center gap-4 ${i === 1 ? "lg:-mt-6" : ""}`}
              >
                <div className="rounded-2xl border border-[#F59E0B]/15 bg-gradient-to-b from-[#FFFBF5] to-white p-3 shadow-[0_12px_40px_rgba(245,158,11,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(245,158,11,0.12)]">
                  <ScaledResumePreview
                    html={html}
                    title={`${template.label} student resume preview`}
                  />
                </div>
                <div className="text-center">
                  <div className="text-[14px] font-semibold text-ink">
                    {template.label}
                  </div>
                  <p className="mt-1.5 max-w-[280px] text-[12px] leading-relaxed text-muted">
                    {template.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
