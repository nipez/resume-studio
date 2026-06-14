import { ScaledResumePreview } from "@/components/resume/resume-preview";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { SAMPLE_RESUME_DATA } from "@/lib/resume/sample-data";
import type { TemplateStyle } from "@/lib/types/resume";

const TEMPLATES: { style: TemplateStyle; label: string }[] = [
  { style: "classic", label: "Classic" },
  { style: "twocol", label: "Two-Column" },
  { style: "editorial", label: "Editorial" },
];

export function TemplateShowcase() {
  return (
    <div className="mt-8">
      <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-sidebar-footer">
        Resume templates
      </h2>
      <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">
        Three print-ready layouts ported from the prototype. PR #4 wires these to
        your live resume library and editor.
      </p>
      <div className="mt-5 flex flex-wrap gap-6">
        {TEMPLATES.map((template) => {
          const html = buildResumeHTML({
            templateStyle: template.style,
            data: SAMPLE_RESUME_DATA,
          });

          return (
            <div key={template.style} className="flex flex-col gap-3">
              <ScaledResumePreview
                html={html}
                title={`${template.label} resume preview`}
              />
              <div className="text-center text-[13px] font-semibold text-ink">
                {template.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
