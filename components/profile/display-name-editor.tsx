"use client";

import { updateProfileFullName } from "@/lib/profile/actions";
import { isEmailDerivedName } from "@/lib/profile/utils";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type DisplayNameEditorProps = {
  displayName: string;
  profileFullName: string | null;
  email?: string | null;
  variant?: "dark" | "light";
};

export function DisplayNameEditor({
  displayName,
  profileFullName,
  email,
  variant = "light",
}: DisplayNameEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(profileFullName ?? displayName);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const usingEmailFallback =
    !profileFullName?.trim() && isEmailDerivedName(displayName, email);

  function openEdit() {
    setValue(profileFullName?.trim() || "");
    setError("");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError("");
  }

  function save() {
    setError("");
    startTransition(async () => {
      try {
        await updateProfileFullName(value);
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save name");
      }
    });
  }

  if (editing) {
    return (
      <div className="pb-1">
        <label className="sr-only" htmlFor="display-name">
          Display name
        </label>
        <input
          id="display-name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your name"
          autoFocus
          disabled={pending}
          className={
            variant === "dark"
              ? "w-full rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[12px] text-white placeholder:text-white/40 focus:border-accent focus:outline-none"
              : "w-full rounded-md border border-border bg-white px-2 py-1 text-[12px] text-ink placeholder:text-[#9AA3AF] focus:border-accent focus:outline-none"
          }
        />
        {error ? (
          <p
            className={`mt-1 text-[10px] leading-snug ${
              variant === "dark" ? "text-[#ffb4b4]" : "text-[#B23B3B]"
            }`}
          >
            {error}
          </p>
        ) : null}
        <div className="mt-1.5 flex gap-1">
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="cursor-pointer rounded border-none bg-accent px-2 py-0.5 text-[10.5px] font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={cancelEdit}
            className={
              variant === "dark"
                ? "cursor-pointer rounded border-none bg-transparent px-1 py-0.5 text-[10.5px] font-semibold text-sidebar-subtle hover:text-white"
                : "cursor-pointer rounded border-none bg-transparent px-1 py-0.5 text-[10.5px] font-semibold text-muted hover:text-ink"
            }
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={openEdit}
        className="group flex w-full cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-left"
        title="Edit display name"
      >
        <span
          className={
            variant === "dark"
              ? "truncate text-[11px] text-sidebar-subtle group-hover:text-white"
              : "truncate text-[12px] text-muted group-hover:text-ink"
          }
        >
          {usingEmailFallback ? "Set your name" : "Edit display name"}
        </span>
        <span
          className={
            variant === "dark"
              ? "shrink-0 text-[10px] text-sidebar-footer opacity-0 transition-opacity group-hover:opacity-100"
              : "shrink-0 text-[10px] text-muted opacity-0 transition-opacity group-hover:opacity-100"
          }
        >
          ✎
        </span>
      </button>
    </div>
  );
}
