"use client";

import { loadWorkspaceDraft, saveJobDraft } from "@/lib/job-draft/actions";
import { readJobDraft, writeJobDraft, type JobDraft } from "@/lib/job-draft/storage";
import { useCallback, useEffect, useRef, useState } from "react";

// Hydrate from the server once per tab session. Within a tab, later mounts read
// the localStorage cache (which holds the freshest local edits) so switching
// between the Tailor/Cover/Questions tabs never clobbers un-synced typing. A new
// tab/device starts a new session and pulls the account copy from the server.
const HYDRATED_FLAG = "resume_studio_jobdraft_hydrated_v1";
const SAVE_DEBOUNCE_MS = 600;

export function useJobDraft() {
  const [draft, setDraft] = useState<JobDraft>(() => readJobDraft());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(readJobDraft());

    let alreadyHydrated = false;
    try {
      alreadyHydrated = sessionStorage.getItem(HYDRATED_FLAG) === "1";
    } catch {
      // sessionStorage unavailable — fall through and hydrate anyway.
    }
    if (alreadyHydrated) return;

    let cancelled = false;
    loadWorkspaceDraft()
      .then((remote) => {
        if (cancelled) return;
        try {
          sessionStorage.setItem(HYDRATED_FLAG, "1");
        } catch {
          // ignore
        }
        if (remote?.draft) {
          // Fill-only merge: the account copy only populates fields that are
          // currently EMPTY locally. It never overwrites in-progress local edits,
          // so a background hydration can't clear a just-generated/typed cover
          // letter (which previously left draft.coverText empty and the Save
          // button disabled while the letter was still visible). A fresh device
          // has empty fields, so it still pulls the full account copy.
          const local = readJobDraft();
          const next: JobDraft = { ...local };
          (Object.keys(remote.draft) as (keyof JobDraft)[]).forEach((key) => {
            const remoteValue = remote.draft[key];
            const localValue = local[key];
            if (
              typeof remoteValue === "string" &&
              remoteValue.trim() !== "" &&
              (!localValue || localValue.trim() === "")
            ) {
              next[key] = remoteValue;
            }
          });
          writeJobDraft(next);
          setDraft(next);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((patch: Partial<JobDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      writeJobDraft(next);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveJobDraft(next).catch(() => {});
      }, SAVE_DEBOUNCE_MS);
      return next;
    });
  }, []);

  return { draft, update };
}
