"use client";

import { Toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { importResumeVersion } from "@/lib/resume/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

type ImportModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ImportModal({ open, onClose }: ImportModalProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importText, setImportText] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const reset = useCallback(() => {
    setImportText("");
    setFileName("");
    setError("");
  }, []);

  function handleClose() {
    if (busy) return;
    reset();
    onClose();
  }

  async function readTextFile(file: File): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/ai/extract-text", { method: "POST", body: form });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Could not read PDF");
      }
      const j = await res.json();
      return j.text as string;
    }
    return file.text();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setFileName(file.name);
    try {
      const text = await readTextFile(file);
      if (!text.trim()) throw new Error("empty");
      setImportText(text);
    } catch {
      setError("Could not read that file automatically — paste the text below instead.");
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    const raw = importText.trim();
    if (!raw) {
      setError("Paste your resume text or upload a file first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Import failed");

      const version = await importResumeVersion(j.data);
      reset();
      onClose();
      setToast(
        j.mock
          ? "Imported (demo mode) — add API key for AI structuring"
          : "Imported and set as your default resume"
      );
      router.push(`/editor/${version.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null;

  return (
    <>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(13,15,20,0.55)] p-6 backdrop-blur-[3px]"
        onClick={handleClose}
      >
        <div
          className="max-h-[90vh] w-[640px] max-w-full animate-[fadeUp_0.25s_ease_both] overflow-auto rounded-[18px] bg-white p-7 shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-[21px] font-semibold tracking-[-0.02em] text-ink">
                Import your default resume
              </h2>
              <p className="mt-[7px] max-w-[480px] text-[13.5px] leading-[1.5] text-muted">
                Upload a PDF or text file, or paste your resume below. AI will structure
                it into editable sections and set it as your{" "}
                <b className="text-[#2456D6]">default starting point</b> — the base every
                tailored version begins from.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-[#F2F3F5] text-base text-[#5a6573] hover:bg-[#E6E8EC]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <label
            className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] border-dashed border-[#CFD5DD] bg-[#FAFBFC] p-[16px_18px] hover:border-accent hover:bg-[#F5F8FF]"
            onClick={() => fileRef.current?.click()}
          >
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-[#EEF3FF] text-lg text-[#2456D6]">
              ↑
            </span>
            <span className="flex-1">
              <span className="block text-[13.5px] font-semibold text-[#2b3140]">
                Upload a file
              </span>
              <span className="mt-0.5 block text-xs text-[#8A92A0]">
                PDF, TXT or Markdown — text is extracted automatically
              </span>
            </span>
            {fileName ? (
              <span className="max-w-[160px] truncate text-xs font-semibold text-[#0E9F6E]">
                ✓ {fileName}
              </span>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.md,.markdown,text/plain"
              className="hidden"
              onChange={handleFile}
            />
          </label>

          <div className="my-4 flex items-center gap-3 text-xs font-semibold text-[#A4ABB6]">
            <span className="h-px flex-1 bg-[#E6E8EC]" />
            OR PASTE
            <span className="h-px flex-1 bg-[#E6E8EC]" />
          </div>

          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={9}
            placeholder="Paste your full resume text here…"
            className="w-full resize-y rounded-xl border border-[#DFE3E8] p-[13px_14px] text-[13.5px] leading-[1.55] text-[#1a1f29] focus:border-accent focus:outline-none"
          />

          {error ? (
            <div className="mt-3 rounded-[9px] border border-[#F3D2D2] bg-[#FFF4F4] px-3 py-2.5 text-[13px] text-[#B23B3B]">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
            <Link
              href="/build"
              className="text-[13px] font-semibold text-accent hover:underline"
            >
              Don&apos;t have a resume? Build step by step →
            </Link>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={busy}
                className="rounded-[11px] border border-[#DCE0E6] bg-white px-[18px] py-[11px] text-[13.5px] font-semibold text-[#3a4350] hover:bg-[#F4F5F7] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-[11px] bg-accent px-[18px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6] disabled:opacity-60"
              >
                {busy ? <Spinner /> : null}
                {busy ? "Structuring…" : "Import & set as default"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </>
  );
}
