"use client";

import { updateResumeVersion } from "@/lib/resume/actions";
import { isGenericResumeName } from "@/lib/resume/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type EditableVersionNameProps = {
  versionId: string;
  name: string;
  className?: string;
  compact?: boolean;
  /** Increment to force open the rename input (e.g. from an Actions “Rename” button). */
  editRequest?: number;
  /** Suggested job-based name (Role · Company) for one-click rename. */
  suggestedName?: string | null;
};

function stripCopySuffix(value: string) {
  return value.replace(/(?:\s*\(copy\))+\s*$/i, "").trim();
}

function hasCopySuffix(value: string) {
  return /(?:\s*\(copy\))+\s*$/i.test(value);
}

export function EditableVersionName({
  versionId,
  name: initialName,
  className = "",
  compact = false,
  editRequest = 0,
  suggestedName = null,
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
    if (editRequest > 0) setEditing(true);
  }, [editRequest]);

  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [editing]);

  function cancel() {
    setName(initialName);
    setEditing(false);
    setError("");
  }

  function commit(nextName: string) {
    const trimmed = nextName.trim();
    if (!trimmed) {
      setError("Name can't be empty");
      setName(initialName);
      setEditing(false);
      return;
    }
    if (trimmed === initialName) {
      setEditing(false);
      setError("");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await updateResumeVersion(versionId, { name: trimmed });
        setName(trimmed);
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not rename");
        setName(initialName);
        setEditing(false);
      }
    });
  }

  function save() {
    commit(name);
  }

  function removeCopySuffix() {
    const cleaned = stripCopySuffix(initialName);
    if (!cleaned || cleaned === initialName) return;
    commit(cleaned);
  }

  const showSuggested =
    Boolean(suggestedName?.trim()) &&
    suggestedName!.trim() !== initialName.trim() &&
    isGenericResumeName(initialName);

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
          className={`w-full rounded-lg border border-accent bg-white px-2.5 py-1.5 font-display font-semibold leading-tight tracking-[-0.01em] text-ink shadow-[0_0_0_3px_rgba(107,78,255,0.12)] focus:outline-none disabled:opacity-60 ${
            compact ? "text-[14px]" : "text-[17px]"
          }`}
          aria-label="Resume name"
        />
        <p className="mt-1 text-[11px] text-muted">
          {pending ? "Saving…" : "Enter to save · Esc to cancel"}
        </p>
        {error ? <p className="mt-0.5 text-[11px] text-[#B23B3B]">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex min-w-0 items-start gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={pending}
          className="group flex min-w-0 flex-1 cursor-text items-center gap-2 rounded-lg border border-transparent px-1.5 py-1 text-left transition-colors hover:border-[#E2E5EA] hover:bg-[#FAFBFC]"
          title="Click to rename"
        >
          <span
            className={`min-w-0 flex-1 font-display font-semibold leading-tight tracking-[-0.01em] text-ink ${
              compact ? "line-clamp-2 text-[14px]" : "truncate text-[17px]"
            }`}
            title={name}
          >
            {name}
          </span>
          <span
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#8A92A0] opacity-70 transition-opacity group-hover:bg-[#EEF0F3] group-hover:opacity-100"
            aria-hidden
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" strokeLinecap="round" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3l1 1a2.1 2.1 0 0 1 0 3L8 20l-4 1 1-4 11.5-13.5z" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
      {showSuggested ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => commit(suggestedName!.trim())}
          className="mt-1 cursor-pointer border-none bg-transparent p-0 text-left text-[11.5px] font-semibold text-accent hover:underline disabled:opacity-50"
          title={`Rename to ${suggestedName}`}
        >
          Rename to {suggestedName}
        </button>
      ) : hasCopySuffix(name) ? (
        <button
          type="button"
          disabled={pending}
          onClick={removeCopySuffix}
          className="mt-1 cursor-pointer border-none bg-transparent p-0 text-[11.5px] font-semibold text-accent hover:underline disabled:opacity-50"
        >
          Remove “(copy)”
        </button>
      ) : null}
      {error ? <p className="mt-1 text-[11px] text-[#B23B3B]">{error}</p> : null}
    </div>
  );
}
