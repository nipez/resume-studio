"use client";

import { loadWorkspaceDraft, saveJobDraft, clearWorkspaceJobDraft } from "@/lib/job-draft/actions";
import { mergeSeedIntoDraft } from "@/lib/job-draft/merge-seed";
import type { CoverPrepSeed } from "@/lib/cover/prep-seed";
import {
  clearJobDraftLocal,
  readJobDraft,
  writeJobDraft,
  EMPTY_JOB_DRAFT,
  type JobDraft,
} from "@/lib/job-draft/storage";
import { useCallback, useEffect, useRef, useState } from "react";

// Hydrate from the server once per tab session. Within a tab, later mounts read
// the localStorage cache (which holds the freshest local edits) so switching
// between the Tailor/Cover/Questions tabs never clobbers un-synced typing. A new
// tab/device starts a new session and pulls the account copy from the server.
const HYDRATED_FLAG = "resume_studio_jobdraft_hydrated_v1";
const SAVE_DEBOUNCE_MS = 600;

function applyDraft(next: JobDraft) {
  writeJobDraft(next);
  return next;
}

export function useJobDraft(prepSeed?: CoverPrepSeed | null) {
  const prepSeedRef = useRef(prepSeed);
  prepSeedRef.current = prepSeed;

  const [draft, setDraft] = useState<JobDraft>(() => {
    const local = readJobDraft();
    if (!prepSeed) return local;
    return applyDraft(mergeSeedIntoDraft(local, prepSeed));
  });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const local = readJobDraft();
    const seeded = prepSeed
      ? applyDraft(mergeSeedIntoDraft(local, prepSeed))
      : local;
    setDraft(seeded);

    let alreadyHydrated = false;
    try {
      alreadyHydrated = sessionStorage.getItem(HYDRATED_FLAG) === "1";
    } catch {
      // sessionStorage unavailable — fall through and hydrate anyway.
    }

    const needsRemoteDesc = Boolean(prepSeed && !seeded.jobDesc.trim());
    if (alreadyHydrated && !needsRemoteDesc) return;

    let cancelled = false;
    loadWorkspaceDraft()
      .then((remote) => {
        if (cancelled) return;
        try {
          sessionStorage.setItem(HYDRATED_FLAG, "1");
        } catch {
          // ignore
        }
        if (!remote?.draft) return;

        const current = readJobDraft();
        const next: JobDraft = prepSeedRef.current
          ? mergeSeedIntoDraft(current, prepSeedRef.current)
          : { ...current };

        (Object.keys(remote.draft) as (keyof JobDraft)[]).forEach((key) => {
          const remoteValue = remote.draft[key];
          const localValue = next[key];
          if (
            typeof remoteValue === "string" &&
            remoteValue.trim() !== "" &&
            (!localValue || localValue.trim() === "")
          ) {
            next[key] = remoteValue;
          }
        });

        applyDraft(next);
        setDraft(next);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [prepSeed]);

  useEffect(() => {
    const syncFromStorage = () => setDraft(readJobDraft());
    window.addEventListener("resume-studio:job-draft-sync", syncFromStorage);
    return () =>
      window.removeEventListener("resume-studio:job-draft-sync", syncFromStorage);
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

  const reset = useCallback(() => {
    clearJobDraftLocal();
    setDraft(EMPTY_JOB_DRAFT);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    clearWorkspaceJobDraft().catch(() => {});
  }, []);

  return { draft, update, reset };
}
