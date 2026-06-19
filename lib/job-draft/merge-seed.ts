import type { CoverPrepSeed } from "@/lib/cover/prep-seed";
import type { JobDraft } from "@/lib/job-draft/storage";

export function mergeSeedIntoDraft(local: JobDraft, seed: CoverPrepSeed): JobDraft {
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
