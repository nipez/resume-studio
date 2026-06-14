import { ScaledResumePreview } from "@/components/resume/resume-preview";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { SAMPLE_RESUME_DATA } from "@/lib/resume/sample-data";
import type { TemplateStyle } from "@/lib/types/resume";

const TEMPLATES: { style: TemplateStyle; label: string }[] = [
  { style: "classic", label: "Classic" },
  { style: "twocol", label: "Two-Column" },
  { style: "editorial", label: "Editorial" },
];

export function TemplateGallery() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Three templates, print-ready
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Classic, Two-Column, and Editorial — ported pixel-for-pixel from the
          prototype with full PDF export support.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-8 lg:justify-start">
        {TEMPLATES.map((template) => {
          const html = buildResumeHTML({
            templateStyle: template.style,
            data: SAMPLE_RESUME_DATA,
          });

          return (
            <div key={template.style} className="flex flex-col items-center gap-3">
              <ScaledResumePreview
                html={html}
                title={`${template.label} resume preview`}
              />
              <div className="text-[13px] font-semibold text-ink">
                {template.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
