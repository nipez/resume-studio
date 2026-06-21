"use client";

import { updateResumeVersion } from "@/lib/resume/actions";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type EditableVersionNameProps = {
  versionId: string;
  name: string;
  className?: string;
  compact?: boolean;
};

export function EditableVersionName({
  versionId,
  name: initialName,
  className = "",
  compact = false,
}: EditableVersionNameProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function cancel() {
    setName(initialName);
    setEditing(false);
    setError("");
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name can't be empty");
      setName(initialName);
      setEditing(false);
      return;
    }
    if (trimmed === initialName) {
      setEditing(false);
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await updateResumeVersion(versionId, { name: trimmed });
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not rename");
        setName(initialName);
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <div className={className}>
        <input
          ref={inputRef}
          value={name}
          disabled={pending}
          onChange={(e) => setName(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              inputRef.current?.blur();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          className={`w-full rounded-lg border border-accent bg-white px-2 py-1 font-display font-semibold leading-tight tracking-[-0.01em] text-ink focus:outline-none disabled:opacity-60 ${
            compact ? "text-[14px]" : "text-[17px]"
          }`}
          aria-label="Resume name"
        />
        {error ? <p className="mt-1 text-[11px] text-[#B23B3B]">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="group flex w-full cursor-text items-start gap-1.5 rounded-lg border border-transparent px-1 py-0.5 text-left transition-colors hover:border-[#E2E5EA] hover:bg-[#FAFBFC]"
        title="Click to rename"
      >
        <span
          className={`min-w-0 flex-1 font-display font-semibold leading-tight tracking-[-0.01em] text-ink ${
            compact ? "text-[14px]" : "text-[17px]"
          }`}
        >
          {initialName}
        </span>
        <span className="mt-0.5 shrink-0 text-[11px] font-semibold text-[#9AA3AF] opacity-0 transition-opacity group-hover:opacity-100">
          Rename
        </span>
      </button>
    </div>
  );
}
