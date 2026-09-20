import { SectionHeader } from "@/components/marketing/primitives";
import { ScaledResumePreview } from "@/components/resume/resume-preview";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { SAMPLE_RESUME_DATA } from "@/lib/resume/sample-data";
import type { TemplateStyle } from "@/lib/types/resume";

const TEMPLATES: { style: TemplateStyle; label: string }[] = [
  { style: "classic", label: "Classic" },
  { style: "modern", label: "Modern" },
  { style: "twocol", label: "Two-Column" },
  { style: "editorial", label: "Editorial" },
];

export function TemplateGallery() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(47,107,255,0.05),transparent_50%)]" />
      <div className="relative">
        <SectionHeader
          eyebrow="Templates"
          title="Print-ready templates"
          description="Classic, Modern, Two-Column, and Editorial — clean layouts with full PDF export."
        />

        <div className="mt-14 flex flex-wrap justify-center gap-10 lg:justify-start">
          {TEMPLATES.map((template, i) => {
            const html = buildResumeHTML({
              templateStyle: template.style,
              data: SAMPLE_RESUME_DATA,
            });

            return (
              <div
                key={template.style}
                className={`flex flex-col items-center gap-4 ${i === 1 ? "lg:-mt-6" : ""}`}
              >
                <div className="rounded-2xl border border-border bg-white p-3 shadow-[0_12px_40px_rgba(15,17,22,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(47,107,255,0.12)]">
                  <ScaledResumePreview
                    html={html}
                    title={`${template.label} resume preview`}
                  />
                </div>
                <div className="text-center">
                  <div className="font-display text-[14px] font-semibold text-ink">
                    {template.label}
                  </div>
                  <div className="mt-1 h-0.5 w-8 mx-auto rounded-full bg-accent/40" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
