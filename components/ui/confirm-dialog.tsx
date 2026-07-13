"use client";

import { Spinner } from "@/components/ui/spinner";
import { useEffect } from "react";

/** Close on Escape — shared by modals and dialogs. */
export function useEscapeKey(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, onClose]);
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive actions get a red confirm button. */
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Styled replacement for native confirm() with Escape + ARIA. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEscapeKey(open && !pending, onCancel);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-[rgba(13,15,20,0.55)] p-6 backdrop-blur-[2px]"
      onClick={pending ? undefined : onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-[420px] animate-[fadeUp_0.2s_ease_both] rounded-[16px] bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="font-display text-[17px] font-semibold tracking-[-0.01em] text-ink"
        >
          {title}
        </h2>
        <p className="mt-2 text-[13.5px] leading-[1.55] text-muted">{description}</p>
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="cursor-pointer rounded-[10px] border border-[#DCE0E6] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#3a4350] hover:bg-[#F4F5F7] disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            autoFocus
            className={`inline-flex cursor-pointer items-center gap-2 rounded-[10px] border-none px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60 ${
              danger
                ? "bg-[#B23B3B] hover:bg-[#9E3030]"
                : "bg-accent hover:bg-[#1E54E6]"
            }`}
          >
            {pending ? <Spinner className="h-3.5 w-3.5" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
