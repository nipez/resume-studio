"use client";

import { loadWorkspaceDraft, saveQADraft } from "@/lib/job-draft/actions";
import { readQADraft, writeQADraft, type QAItem } from "@/lib/job-draft/storage";
import { useCallback, useEffect, useRef, useState } from "react";

// Mirrors useJobDraft: hydrate the account copy once per tab session, then keep
// localStorage in sync and debounce writes back to the server.
const HYDRATED_FLAG = "resume_studio_qadraft_hydrated_v1";
const SAVE_DEBOUNCE_MS = 600;

export function useQADraft() {
  const [items, setItems] = useState<QAItem[]>(() => readQADraft());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(readQADraft());

    let alreadyHydrated = false;
    try {
      alreadyHydrated = sessionStorage.getItem(HYDRATED_FLAG) === "1";
    } catch {
      // ignore
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
        // Only adopt the server copy when it actually has saved questions, so we
        // don't replace the local starter row with an empty array.
        if (remote && remote.qa.length > 0) {
          writeQADraft(remote.qa);
          setItems(remote.qa);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: QAItem[]) => {
    setItems(next);
    writeQADraft(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveQADraft(next).catch(() => {});
    }, SAVE_DEBOUNCE_MS);
  }, []);

  return { items, persist };
}
