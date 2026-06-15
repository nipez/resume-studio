"use client";

import {
  ACCENT_PRESETS,
  DEFAULT_ACCENT,
  normalizeAccent,
} from "@/lib/resume/accent-color";
import { useEffect, useRef, useState } from "react";

type AccentColorPickerProps = {
  value?: string;
  onChange: (color: string) => void;
};

export function AccentColorPicker({ value, onChange }: AccentColorPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = normalizeAccent(value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-[#DFE3E8] bg-white px-2.5 py-1.5 text-[12.5px] font-semibold text-[#5A6573] transition-colors hover:border-[#C8CED6]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span
          className="h-4 w-4 rounded-full border border-black/10 shadow-inner"
          style={{ backgroundColor: current }}
        />
        Accent
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] rounded-xl border border-[#E2E6EB] bg-white p-3 shadow-[0_12px_32px_rgba(15,17,22,0.14)]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8A92A0]">
            Accent color
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ACCENT_PRESETS.map((preset) => {
              const selected = current === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  title={preset.label}
                  onClick={() => {
                    onChange(preset.value);
                    setOpen(false);
                  }}
                  className={`h-8 w-8 cursor-pointer rounded-full border-2 transition-transform hover:scale-105 ${
                    selected ? "border-ink" : "border-transparent"
                  }`}
                  style={{ backgroundColor: preset.value }}
                />
              );
            })}
          </div>
          <label className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-[#5A6573]">
            Custom
            <input
              type="color"
              value={current}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-[#DFE3E8] bg-white p-0.5"
            />
          </label>
          {current !== DEFAULT_ACCENT ? (
            <button
              type="button"
              onClick={() => {
                onChange(DEFAULT_ACCENT);
                setOpen(false);
              }}
              className="mt-2 cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[#2456D6] hover:underline"
            >
              Reset to default
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
