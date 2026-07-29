"use client";

import { setLibraryApplicationStatus } from "@/lib/applications/actions";
import type { ApplicationStatus } from "@/lib/applications/types";
import {
  APPLICATION_STATUSES,
  appStatusMeta,
} from "@/lib/applications/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type LibraryStatusControlProps = {
  versionId: string;
  status: ApplicationStatus | null;
  applicationId?: string | null;
  role?: string;
  company?: string;
  disabled?: boolean;
  onError?: (message: string) => void;
};

export function LibraryStatusControl({
  versionId,
  status,
  applicationId = null,
  role = "",
  company = "",
  disabled = false,
  onError,
}: LibraryStatusControlProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const current = status ?? "";
  const meta = status ? appStatusMeta(status) : null;

  return (
    <select
      value={current}
      disabled={disabled || pending || (!status && !role && !company)}
      aria-label="Application status"
      title={
        status
          ? "Update application status"
          : "Log this cut and set its outcome"
      }
      onChange={(e) => {
        const next = e.target.value as ApplicationStatus;
        if (!next) return;
        startTransition(async () => {
          try {
            await setLibraryApplicationStatus({
              versionId,
              status: next,
              applicationId: applicationId ?? undefined,
              role,
              company,
            });
            router.refresh();
          } catch (err) {
            onError?.(
              err instanceof Error ? err.message : "Could not update status"
            );
          }
        });
      }}
      className="max-w-full cursor-pointer rounded-lg border px-2 py-1.5 text-[11.5px] font-bold disabled:cursor-not-allowed disabled:opacity-55"
      style={
        meta
          ? {
              borderColor: meta.bd,
              background: meta.bg,
              color: meta.fg,
            }
          : {
              borderColor: "#D5DAE0",
              background: "#FFFFFF",
              color: "#5A6573",
            }
      }
    >
      {!status ? (
        <option value="" disabled>
          Set status…
        </option>
      ) : null}
      {APPLICATION_STATUSES.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
