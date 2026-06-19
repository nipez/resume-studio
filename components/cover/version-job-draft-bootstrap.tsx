"use client";

import type { CoverPrepSeed } from "@/lib/cover/prep-seed";
import { readJobDraft, writeJobDraft, type JobDraft } from "@/lib/job-draft/storage";
import { useEffect, useRef } from "react";

const HYDRATED_FLAG = "resume_studio_jobdraft_hydrated_v1";

type VersionJobDraftBootstrapProps = {
  versionId: string;
  seed: CoverPrepSeed | null;
};

function mergeSeedIntoDraft(local: JobDraft, seed: CoverPrepSeed): JobDraft {
  const next = { ...local };
  (Object.keys(seed) as (keyof CoverPrepSeed)[]).forEach((key) => {
    const remoteValue = seed[key];
    const localValue = local[key as keyof JobDraft];
    if (
      typeof remoteValue === "string" &&
      remoteValue.trim() !== "" &&
      (!localValue || localValue.trim() === "")
    ) {
      next[key as keyof JobDraft] = remoteValue;
    }
  });
  return next;
}

/** Pre-fills the shared job draft from a resume version's tailored job context. */
export function VersionJobDraftBootstrap({
  versionId,
  seed,
}: VersionJobDraftBootstrapProps) {
  const loaded = useRef<string | null>(null);

  useEffect(() => {
    if (!seed || loaded.current === versionId) return;
    loaded.current = versionId;

    const next = mergeSeedIntoDraft(readJobDraft(), seed);
    writeJobDraft(next);
    try {
      sessionStorage.setItem(HYDRATED_FLAG, "1");
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("resume-studio:job-draft-sync"));
  }, [seed, versionId]);

  return null;
}
