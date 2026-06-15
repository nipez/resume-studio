"use client";

import { PAGE_WIDTH_PX } from "@/lib/resume/build-resume-html";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_MIN_HEIGHT_PX = 1056;
const CANVAS_PADDING_PX = 40;

type FitResumePreviewProps = {
  html: string;
  title?: string;
  className?: string;
};

export function FitResumePreview({
  html,
  title = "Resume preview",
  className = "",
}: FitResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pageHeight, setPageHeight] = useState(PAGE_MIN_HEIGHT_PX);
  const [scale, setScale] = useState(1);

  const measure = useCallback(() => {
    const iframe = iframeRef.current;
    const container = containerRef.current;
    if (!container) return;

    let height = PAGE_MIN_HEIGHT_PX;
    if (iframe?.contentDocument?.body) {
      height = Math.max(
        PAGE_MIN_HEIGHT_PX,
        iframe.contentDocument.documentElement.scrollHeight,
        iframe.contentDocument.body.scrollHeight
      );
    }
    setPageHeight(height);

    const availW = Math.max(container.clientWidth - CANVAS_PADDING_PX * 2, 1);
    const availH = Math.max(container.clientHeight - CANVAS_PADDING_PX * 2, 1);
    const nextScale = Math.min(availW / PAGE_WIDTH_PX, availH / height, 1);
    setScale(nextScale);
  }, []);

  useEffect(() => {
    measure();
  }, [html, measure]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure]);

  const scaledWidth = PAGE_WIDTH_PX * scale;
  const scaledHeight = pageHeight * scale;

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#D8DCE2] ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(15,17,22,0.06) 1px, transparent 0)",
        backgroundSize: "18px 18px",
      }}
    >
      <div
        className="relative flex-none"
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        <iframe
          ref={iframeRef}
          title={title}
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
  );
}
