"use client";

type ResumePreviewModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  html: string;
  onExport: () => void;
};

export function ResumePreviewModal({
  open,
  onClose,
  title,
  html,
  onExport,
}: ResumePreviewModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(13,15,20,0.55)] p-6 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-[860px] max-w-full flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EEF0F3] px-6 py-4">
          <div>
            <h2 className="font-display text-[18px] font-semibold text-ink">
              Resume preview
            </h2>
            <p className="mt-0.5 text-[13px] text-muted">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExport}
              className="cursor-pointer rounded-[9px] border-none bg-accent px-[13px] py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              ↓ Export PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#F2F3F5] text-base text-[#5a6573] hover:bg-[#E6E8EC]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[#F5F7FA] p-6">
          <div className="mx-auto w-fit overflow-hidden rounded-[10px] border border-[#E2E5EA] bg-white shadow-[0_8px_30px_rgba(15,17,22,0.08)]">
            <iframe
              srcDoc={html}
              title={title}
              className="block h-[1052px] w-[816px] border-none bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
