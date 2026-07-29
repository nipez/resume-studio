"use client";

import { ResumePreviewModal } from "@/components/applications/resume-preview-modal";
import { openPrintHtml } from "@/lib/resume/build-cover-html";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import type { ResumeVersion } from "@/lib/resume/db-types";
import { versionCardMeta } from "@/lib/resume/utils";
import Link from "next/link";
import { useMemo, useState } from "react";

type DefaultResumeHeroProps = {
  version: ResumeVersion;
};

export function DefaultResumeHero({ version }: DefaultResumeHeroProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const meta = versionCardMeta(version);
  const previewHtml = useMemo(
    () =>
      buildResumeHTML(
        {
          templateStyle: version.template_style,
          data: version.data,
        },
        false
      ),
    [version.data, version.template_style]
  );

  function exportPdf() {
    openPrintHtml(
      buildResumeHTML(
        {
          templateStyle: version.template_style,
          data: version.data,
        },
        true
      )
    );
  }

  return (
    <>
      <section
        aria-label="Primary resume"
        className="relative mb-7 overflow-hidden rounded-[22px] border border-[#CDEAE6] bg-[linear-gradient(135deg,#F3FBFA_0%,#FFFFFF_48%,#F7F8FF_100%)] px-5 py-5 sm:px-7 sm:py-6"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#0FB5A6]/12 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-[#6B4EFF]/08 blur-3xl"
          aria-hidden
        />

        <div className="relative grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#9DE4DB]/70 bg-white/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-teal-dark">
              <span aria-hidden>★</span>
              Primary · Default resume
            </div>

            <h2 className="mt-3 font-display text-[26px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[30px]">
              {version.name}
            </h2>
            <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-muted">
              {meta.headline}
            </p>
            <p className="mt-2 text-[12.5px] text-[#8A92A0]">
              {meta.meta} · {meta.updated} · {meta.badge}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-[#0FB5A6]/45 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-teal-dark transition-colors hover:border-teal hover:bg-[#F3FBFA]"
              >
                Preview
              </button>
              <Link
                href={`/editor/${version.id}`}
                className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-dark"
              >
                Open editor
              </Link>
              <Link
                href={`/tailor?v=${version.id}&new=1`}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-white/90 px-4 py-2.5 text-[13.5px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
              >
                Tailor from this
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="group mx-auto w-fit cursor-pointer border-none bg-transparent p-0 text-left"
            aria-label={`Preview ${version.name}`}
          >
            <div className="h-[286px] w-[220px] overflow-hidden rounded-[14px] border border-[#D7E8E5] bg-white shadow-[0_14px_36px_rgba(15,17,22,0.1)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_40px_rgba(15,17,22,0.14)]">
              <iframe
                srcDoc={previewHtml}
                scrolling="no"
                title={`${version.name} preview`}
                className="pointer-events-none block h-[1056px] w-[816px] origin-top-left scale-[0.27] border-none bg-white"
              />
            </div>
            <span className="mt-2 block text-center text-[12px] font-semibold text-teal-dark group-hover:underline">
              Click to preview
            </span>
          </button>
        </div>
      </section>

      <ResumePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={version.name}
        html={previewHtml}
        onExport={exportPdf}
      />
    </>
  );
}
