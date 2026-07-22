"use client";

import { loadWorkspaceDraft, saveQADraft } from "@/lib/job-draft/actions";
import {
  emptyQADraft,
  readQADraft,
  readQAScope,
  writeQADraft,
  writeQAScope,
  type QAItem,
} from "@/lib/job-draft/storage";
import { useCallback, useEffect, useRef, useState } from "react";

// Mirrors useJobDraft: hydrate the account copy once per tab session, then keep
// localStorage in sync and debounce writes back to the server.
const HYDRATED_FLAG = "resume_studio_qadraft_hydrated_v1";
const SAVE_DEBOUNCE_MS = 600;

type UseQADraftOptions = {
  /** When this changes (new job / tailored version), start a fresh Q&A list. */
  scopeKey: string;
};

function hasQAContent(items: QAItem[]) {
  return items.some((item) => item.q.trim() || item.a.trim());
}

export function useQADraft({ scopeKey }: UseQADraftOptions) {
  const [items, setItems] = useState<QAItem[]>(() => readQADraft());
  const [scopeReset, setScopeReset] = useState(false);
  const [maybeStale, setMaybeStale] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scopeKeyRef = useRef(scopeKey);
  scopeKeyRef.current = scopeKey;

  const persist = useCallback((next: QAItem[]) => {
    setItems(next);
    writeQADraft(next);
    writeQAScope(scopeKeyRef.current);
    setMaybeStale(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveQADraft(next).catch(() => {});
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const clear = useCallback(() => {
    const next = emptyQADraft();
    persist(next);
    setScopeReset(false);
    setMaybeStale(false);
  }, [persist]);

  useEffect(() => {
    const storedScope = readQAScope();
    if (storedScope && storedScope !== scopeKey) {
      // Job context changed — don't carry over the previous application's Q&A.
      const next = emptyQADraft();
      writeQADraft(next);
      writeQAScope(scopeKey);
      setItems(next);
      setScopeReset(true);
      setMaybeStale(false);
      saveQADraft(next).catch(() => {});
      try {
        sessionStorage.setItem(HYDRATED_FLAG, "1");
      } catch {
        // ignore
      }
      return;
    }

    const localItems = readQADraft();
    if (!storedScope) {
      writeQAScope(scopeKey);
      const prepScoped =
        scopeKey.startsWith("version:") || scopeKey.startsWith("saved:");
      // First visit with a job-specific scope: don't keep another application's Q&A.
      if (hasQAContent(localItems) && prepScoped) {
        const next = emptyQADraft();
        writeQADraft(next);
        setItems(next);
        setScopeReset(true);
        setMaybeStale(false);
        saveQADraft(next).catch(() => {});
        try {
          sessionStorage.setItem(HYDRATED_FLAG, "1");
        } catch {
          // ignore
        }
        return;
      }
      if (hasQAContent(localItems) && scopeKey !== "default") {
        setMaybeStale(true);
      }
    }

    setItems(localItems);

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
        // If scope already diverged while fetching, keep the fresh empty list.
        if (readQAScope() && readQAScope() !== scopeKeyRef.current) return;

        // Don't rehydrate a previous job's Q&A onto a newly scoped draft.
        if (readQAScope() === scopeKeyRef.current && hasQAContent(readQADraft())) {
          return;
        }

        // Only adopt the server copy when it actually has saved questions, so we
        // don't replace the local starter row with an empty array.
        if (remote && remote.qa.length > 0) {
          writeQADraft(remote.qa);
          writeQAScope(scopeKeyRef.current);
          setItems(remote.qa);
          if (scopeKeyRef.current !== "default") setMaybeStale(true);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [scopeKey]);

  return {
    items,
    persist,
    clear,
    scopeReset,
    maybeStale,
    dismissScopeReset: () => {
      setScopeReset(false);
      setMaybeStale(false);
    },
  };
}
