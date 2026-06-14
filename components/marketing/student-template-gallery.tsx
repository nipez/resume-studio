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
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Three templates built for students
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Same professional layouts as the full workspace — previewed with
            real high-school sample data, not a fake executive resume.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-8 lg:justify-start">
          {TEMPLATES.map((template) => {
            const html = buildResumeHTML({
              templateStyle: template.style,
              data: STUDENT_SAMPLE_RESUME_DATA,
            });

            return (
              <div
                key={template.style}
                className="flex max-w-[360px] flex-col items-center gap-3"
              >
                <ScaledResumePreview
                  html={html}
                  title={`${template.label} student resume preview`}
                />
                <div className="text-center">
                  <div className="text-[13px] font-semibold text-ink">
                    {template.label}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
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
