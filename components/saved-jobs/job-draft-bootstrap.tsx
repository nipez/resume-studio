"use client";

import { activateSavedJobForPrep } from "@/lib/saved-jobs/actions";
import { writeJobDraft } from "@/lib/job-draft/storage";
import { useEffect, useRef } from "react";

const HYDRATED_FLAG = "resume_studio_jobdraft_hydrated_v1";

type JobDraftBootstrapProps = {
  savedJobId?: string | null;
};

/** Syncs a saved job into localStorage when landing on prep pages with ?job= */
export function JobDraftBootstrap({ savedJobId }: JobDraftBootstrapProps) {
  const loaded = useRef<string | null>(null);

  useEffect(() => {
    if (!savedJobId || loaded.current === savedJobId) return;
    loaded.current = savedJobId;

    activateSavedJobForPrep(savedJobId)
      .then((draft) => {
        if (!draft) return;
        writeJobDraft(draft);
        try {
          sessionStorage.setItem(HYDRATED_FLAG, "1");
        } catch {
          // ignore
        }
        window.dispatchEvent(new CustomEvent("resume-studio:job-draft-sync"));
      })
      .catch(() => {});
  }, [savedJobId]);

  return null;
}
