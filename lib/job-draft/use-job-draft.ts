"use client";

import { readJobDraft, writeJobDraft, type JobDraft } from "@/lib/job-draft/storage";
import { useCallback, useEffect, useState } from "react";

export function useJobDraft() {
  const [draft, setDraft] = useState<JobDraft>(() => readJobDraft());

  useEffect(() => {
    setDraft(readJobDraft());
  }, []);

  const update = useCallback((patch: Partial<JobDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      writeJobDraft(next);
      return next;
    });
  }, []);

  return { draft, update };
}
