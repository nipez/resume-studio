"use client";

const HINT_STORAGE_KEY = "resume_studio_editor_click_hint_dismissed_v1";

export function isEditorClickHintDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(HINT_STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

export function dismissEditorClickHint(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HINT_STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

type EditorClickHintProps = {
  onDismiss: () => void;
};

export function EditorClickHint({ onDismiss }: EditorClickHintProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-[420px] items-start gap-3 rounded-xl border border-[#CFE0FF] bg-white/95 px-4 py-3.5 shadow-[0_12px_40px_-12px_rgba(47,107,255,0.35)] backdrop-blur-sm">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[#EAF1FF] text-[15px] text-[#2456D6]">
          ✎
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink">
            Click any section on your resume to edit
          </p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-[#5A6573]">
            Summary, experience, skills — select it on the preview and edit in
            the panel on the right.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss hint"
          className="flex-none cursor-pointer rounded-md px-1.5 py-0.5 text-[18px] leading-none text-[#9AA3AF] transition-colors hover:bg-[#F2F3F5] hover:text-ink"
        >
          ×
        </button>
      </div>
    </div>
  );
}
