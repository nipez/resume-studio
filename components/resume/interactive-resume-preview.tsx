"use client";

import {
  PAGE_HEIGHT_PX,
  PAGE_WIDTH_PX,
} from "@/lib/resume/build-resume-html";
import type { ResumeEditSection } from "@/lib/types/resume-editor";
import { useCallback, useEffect, useRef, useState } from "react";

const CANVAS_PADDING_PX = 16;
const PAGE_GAP_PX = 20;

type InteractiveResumePreviewProps = {
  html: string;
  activeSection: ResumeEditSection | null;
  onSectionSelect: (section: ResumeEditSection) => void;
  onPageCountChange?: (pageCount: number) => void;
  reservedRight?: number;
  className?: string;
};

function measureDocumentHeight(doc: Document): number {
  const root = doc.querySelector(".page, .wrap") as HTMLElement | null;
  if (root) {
    return Math.max(
      PAGE_HEIGHT_PX,
      root.scrollHeight,
      Math.ceil(root.getBoundingClientRect().height)
    );
  }
  const body = doc.body;
  if (!body) return PAGE_HEIGHT_PX;
  return Math.max(
    PAGE_HEIGHT_PX,
    Math.ceil(body.getBoundingClientRect().height)
  );
}

export function pageCountForHeight(contentHeight: number): number {
  return Math.max(1, Math.ceil(contentHeight / PAGE_HEIGHT_PX));
}

export function InteractiveResumePreview({
  html,
  activeSection,
  onSectionSelect,
  onPageCountChange,
  reservedRight = 0,
  className = "",
}: InteractiveResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [contentHeight, setContentHeight] = useState(PAGE_HEIGHT_PX);
  const [scale, setScale] = useState(0.75);

  const pageCount = pageCountForHeight(contentHeight);
  const scaledPageWidth = PAGE_WIDTH_PX * scale;
  const scaledPageHeight = PAGE_HEIGHT_PX * scale;
  const stackHeight =
    pageCount * scaledPageHeight + Math.max(0, pageCount - 1) * PAGE_GAP_PX;

  const measure = useCallback(() => {
    const iframe = iframeRef.current;
    const container = containerRef.current;
    if (!container) return;

    let height = PAGE_HEIGHT_PX;
    if (iframe?.contentDocument) {
      height = measureDocumentHeight(iframe.contentDocument);
    }
    setContentHeight(height);

    const availW = Math.max(
      container.clientWidth - CANVAS_PADDING_PX * 2 - reservedRight,
      1
    );
    setScale(Math.min(availW / PAGE_WIDTH_PX, 1));
  }, [reservedRight]);

  useEffect(() => {
    measure();
  }, [html, measure, reservedRight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.data?.type !== "resume-edit") return;
      const section = event.data.section as ResumeEditSection["id"];
      const index =
        event.data.index !== undefined ? Number(event.data.index) : undefined;
      if (!section) return;
      onSectionSelect({ id: section, index });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onSectionSelect]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      {
        type: "resume-active",
        section: activeSection?.id ?? null,
        index: activeSection?.index ?? null,
      },
      "*"
    );
  }, [activeSection, html]);

  useEffect(() => {
    onPageCountChange?.(pageCount);
  }, [pageCount, onPageCountChange]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-auto bg-[#D8DCE2] ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(15,17,22,0.06) 1px, transparent 0)",
        backgroundSize: "18px 18px",
      }}
    >
      <div
        style={{
          padding: CANVAS_PADDING_PX,
          paddingRight: CANVAS_PADDING_PX + reservedRight,
        }}
      >
        <div
          className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#C8CDD4] bg-white/90 px-3.5 py-2 text-[12.5px] shadow-sm backdrop-blur-sm"
          style={{ width: scaledPageWidth }}
        >
          <span className="font-semibold text-ink">
            {pageCount} {pageCount === 1 ? "page" : "pages"} · Letter (8.5×11)
          </span>
          <span className="text-[#7A828F]">Matches PDF export</span>
        </div>

        <div
          className="relative"
          style={{ width: scaledPageWidth, height: stackHeight }}
        >
          {Array.from({ length: pageCount }).map((_, pageIndex) => {
            const top = pageIndex * (scaledPageHeight + PAGE_GAP_PX);
            return (
              <div
                key={pageIndex}
                className="pointer-events-none absolute left-0 rounded-[2px] shadow-[0_10px_40px_rgba(15,17,22,0.16)] ring-1 ring-black/[0.06]"
                style={{
                  top,
                  width: scaledPageWidth,
                  height: scaledPageHeight,
                  zIndex: 0,
                }}
              />
            );
          })}

          <iframe
            ref={iframeRef}
            title="Resume preview"
            srcDoc={html}
            scrolling="no"
            onLoad={measure}
            className="absolute left-0 top-0 z-10 block origin-top-left border-none bg-transparent"
            style={{
              width: PAGE_WIDTH_PX,
              height: contentHeight,
              transform: `scale(${scale})`,
            }}
          />

          {Array.from({ length: pageCount }).map((_, pageIndex) => {
            const top = pageIndex * (scaledPageHeight + PAGE_GAP_PX);
            return (
              <div
                key={`label-${pageIndex}`}
                className="pointer-events-none absolute left-0 z-20"
                style={{
                  top,
                  width: scaledPageWidth,
                  height: scaledPageHeight,
                }}
              >
                <div className="absolute bottom-2 right-3 rounded-md bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-[#5A6573] shadow-sm ring-1 ring-black/[0.05]">
                  Page {pageIndex + 1} of {pageCount}
                </div>

                {pageIndex < pageCount - 1 ? (
                  <div
                    className="absolute left-1/2 z-30 -translate-x-1/2 rounded-full border border-[#C8CDD4] bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8A92A0] shadow-sm"
                    style={{ bottom: -(PAGE_GAP_PX / 2 + 10) }}
                  >
                    Page break
                  </div>
                ) : null}

                {pageIndex < pageCount - 1 ? (
                  <div
                    className="absolute inset-x-4 border-b-2 border-dashed border-[#CFCFD6]"
                    style={{ bottom: 0 }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
