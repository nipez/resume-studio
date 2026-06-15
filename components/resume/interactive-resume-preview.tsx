"use client";

import { PAGE_WIDTH_PX } from "@/lib/resume/build-resume-html";
import type { ResumeEditSection } from "@/lib/types/resume-editor";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_MIN_HEIGHT_PX = 1056;
const CANVAS_PADDING_PX = 20;

type InteractiveResumePreviewProps = {
  html: string;
  activeSection: ResumeEditSection | null;
  onSectionSelect: (section: ResumeEditSection) => void;
  reservedRight?: number;
  className?: string;
};

function measureDocumentHeight(doc: Document): number {
  const root = doc.querySelector(".page, .wrap") as HTMLElement | null;
  if (root) {
    return Math.max(
      PAGE_MIN_HEIGHT_PX,
      root.scrollHeight,
      Math.ceil(root.getBoundingClientRect().height)
    );
  }
  const body = doc.body;
  if (!body) return PAGE_MIN_HEIGHT_PX;
  return Math.max(
    PAGE_MIN_HEIGHT_PX,
    Math.ceil(body.getBoundingClientRect().height)
  );
}

export function InteractiveResumePreview({
  html,
  activeSection,
  onSectionSelect,
  reservedRight = 0,
  className = "",
}: InteractiveResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pageHeight, setPageHeight] = useState(PAGE_MIN_HEIGHT_PX);
  const [scale, setScale] = useState(0.75);

  const measure = useCallback(() => {
    const iframe = iframeRef.current;
    const container = containerRef.current;
    if (!container) return;

    let height = PAGE_MIN_HEIGHT_PX;
    if (iframe?.contentDocument) {
      height = measureDocumentHeight(iframe.contentDocument);
    }
    setPageHeight(height);

    const availW = Math.max(
      container.clientWidth - CANVAS_PADDING_PX * 2 - reservedRight,
      1
    );
    const availH = Math.max(container.clientHeight - CANVAS_PADDING_PX * 2, 1);
    const scaleByWidth = availW / PAGE_WIDTH_PX;
    const scaleByHeight = availH / PAGE_MIN_HEIGHT_PX;
    setScale(Math.min(scaleByWidth, scaleByHeight, 1));
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

  const scaledWidth = PAGE_WIDTH_PX * scale;
  const scaledHeight = pageHeight * scale;

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
        className="flex min-h-full items-start justify-start"
        style={{ padding: CANVAS_PADDING_PX }}
      >
        <div
          className="relative flex-none"
          style={{ width: scaledWidth, height: scaledHeight }}
        >
          <iframe
            ref={iframeRef}
            title="Resume preview"
            srcDoc={html}
            scrolling="no"
            onLoad={measure}
            className="absolute left-0 top-0 block origin-top-left border-none bg-white shadow-[0_10px_40px_rgba(15,17,22,0.16)]"
            style={{
              width: PAGE_WIDTH_PX,
              height: pageHeight,
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
