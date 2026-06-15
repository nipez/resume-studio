"use client";

import { replaceApplicationResumeSnapshot } from "@/lib/applications/actions";
import type { Application } from "@/lib/applications/types";
import { normalizeResumeData } from "@/lib/resume/defaults";
import type { ResumeVersion } from "@/lib/resume/db-types";
import type { TemplateStyle } from "@/lib/types/resume";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

type ReplaceResumeControlsProps = {
  applicationId: string;
  currentVersionId: string | null;
  templateStyle: TemplateStyle;
  versions: ResumeVersion[];
  onReplaced: (patch: Pick<Application, "resume_version_id" | "resume_version_name" | "resume_snapshot">) => void;
};

export function ReplaceResumeControls({
  applicationId,
  currentVersionId,
  templateStyle,
  versions,
  onReplaced,
}: ReplaceResumeControlsProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  function handlePickVersion(versionId: string) {
    setError("");
    startTransition(async () => {
      try {
        await replaceApplicationResumeSnapshot(applicationId, { versionId });
        const version = versions.find((v) => v.id === versionId);
        if (version) {
          onReplaced({
            resume_version_id: version.id,
            resume_version_name: version.name,
            resume_snapshot: {
              name: version.name,
              template_style: version.template_style,
              data: version.data,
            },
          });
        }
        setOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not update resume");
      }
    });
  }

  async function handlePdfUpload(file: File) {
    setError("");
    startTransition(async () => {
      try {
        const form = new FormData();
        form.append("file", file);
        const extractRes = await fetch("/api/ai/extract-text", {
          method: "POST",
          body: form,
        });
        const extractJson = await extractRes.json();
        if (!extractRes.ok) {
          throw new Error(extractJson.error || "Could not read PDF");
        }

        const parseRes = await fetch("/api/ai/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: extractJson.text }),
        });
        const parseJson = await parseRes.json();
        if (!parseRes.ok) {
          throw new Error(parseJson.error || "Could not parse resume");
        }

        const label = `Uploaded: ${file.name.replace(/\.pdf$/i, "")}`;
        const snapshot = {
          name: label,
          template_style: templateStyle,
          data: normalizeResumeData(parseJson.data),
        };

        await replaceApplicationResumeSnapshot(applicationId, {
          snapshot,
          resumeVersionName: label,
        });
        onReplaced({
          resume_version_id: null,
          resume_version_name: label,
          resume_snapshot: snapshot,
        });
        setOpen(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer rounded-lg border-none bg-[#F2F3F5] px-[11px] py-1.5 text-xs font-semibold text-[#3a4350] transition-colors hover:bg-[#E6E8EC] disabled:opacity-60"
      >
        {pending ? "Updating…" : "Change resume"}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-[280px] rounded-xl border border-[#E2E5EA] bg-white p-3 shadow-[0_12px_40px_rgba(15,17,22,0.12)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
            Replace snapshot
          </div>
          <p className="mt-1 text-[12px] leading-[1.45] text-muted">
            Pick a library version or upload the PDF you actually sent.
          </p>
          <div className="mt-3 max-h-[180px] overflow-auto">
            {versions.map((version) => (
              <button
                key={version.id}
                type="button"
                disabled={pending}
                onClick={() => handlePickVersion(version.id)}
                className="mb-1 flex w-full cursor-pointer flex-col rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-[#E2E5EA] hover:bg-[#FAFBFC] disabled:opacity-60"
              >
                <span className="text-[13px] font-semibold text-ink">
                  {version.name}
                  {version.id === currentVersionId ? " (current link)" : ""}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => fileRef.current?.click()}
            className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#CFD5DD] bg-[#FAFBFC] px-3 py-2.5 text-[12.5px] font-semibold text-[#2456D6] hover:border-accent hover:bg-[#F5F8FF] disabled:opacity-60"
          >
            ↑ Upload PDF used
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handlePdfUpload(file);
              e.target.value = "";
            }}
          />
          {error ? (
            <p className="mt-2 text-[12px] text-[#B23B3B]">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
