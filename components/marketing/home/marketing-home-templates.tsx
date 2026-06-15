import { ScaledResumePreview } from "@/components/resume/resume-preview";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { SAMPLE_RESUME_DATA } from "@/lib/resume/sample-data";
import type { TemplateStyle } from "@/lib/types/resume";
import { Reveal } from "./reveal-on-scroll";

const TEMPLATES: { style: TemplateStyle; label: string }[] = [
  { style: "classic", label: "Classic" },
  { style: "twocol", label: "Two-Column" },
  { style: "editorial", label: "Editorial" },
];

export function MarketingHomeTemplates() {
  return (
    <Reveal className="tgrid">
      {TEMPLATES.map((template) => {
        const html = buildResumeHTML({
          templateStyle: template.style,
          data: SAMPLE_RESUME_DATA,
        });

        return (
          <div key={template.style} className="tcard">
            <div className="tpreview">
              <ScaledResumePreview
                html={html}
                title={`${template.label} resume preview`}
              />
            </div>
            <div className="tname">{template.label}</div>
          </div>
        );
      })}
    </Reveal>
  );
}
