"use client";

import type { VersionLinkedApplication } from "@/lib/applications/types";
import { createResumeVersion } from "@/lib/resume/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const MAX_VISIBLE = 5;

type ResumeEditorUsageBannerProps = {
  versionId: string;
  linkedApplications: VersionLinkedApplication[];
};

function linkedApplicationTitle(app: VersionLinkedApplication): string {
  const role = app.role.trim();
  const company = app.company.trim();
  if (role && company) return `${role} · ${company}`;
  if (role) return role;
  if (company) return company;
  return "Untitled application";
}

export function ResumeEditorUsageBanner({
  versionId,
  linkedApplications,
}: ResumeEditorUsageBannerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  if (linkedApplications.length === 0) return null;

  const count = linkedApplications.length;
  const visible =
    expanded || count <= MAX_VISIBLE
      ? linkedApplications
      : linkedApplications.slice(0, MAX_VISIBLE);
  const hiddenCount = count - visible.length;

  function handleDuplicate() {
    startTransition(async () => {
      const copy = await createResumeVersion(versionId);
      router.push(`/editor/${copy.id}`);
    });
  }

  return (
    <div className="flex-none border-b border-[#DDE3F0] bg-gradient-to-r from-[#EEF3FF] to-[#F8FAFC] px-6 py-3.5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-ink">
            Sent with this version ·{" "}
            {count} application{count === 1 ? "" : "s"}
          </p>
          <p className="mt-1 max-w-[640px] text-[12.5px] leading-relaxed text-muted">
            Logged applications keep their snapshots — edits here won&apos;t
            change what you already submitted. For a{" "}
            <span className="font-semibold text-ink">new job</span>, duplicate
            or tailor instead of rewriting this cut.
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {visible.map((app) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                className="inline-flex max-w-full items-center rounded-full border border-[#CFE0FF] bg-white px-3 py-1 text-[12px] font-semibold text-[#1E54E6] transition-colors hover:border-[#2F6BFF] hover:bg-[#EEF3FF]"
              >
                <span className="truncate">{linkedApplicationTitle(app)}</span>
              </Link>
            ))}
            {hiddenCount > 0 ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="rounded-full border border-[#DFE3E8] bg-white px-3 py-1 text-[12px] font-semibold text-muted transition-colors hover:text-ink"
              >
                +{hiddenCount} more
              </button>
            ) : null}
            {expanded && count > MAX_VISIBLE ? (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-[12px] font-semibold text-muted hover:text-ink"
              >
                Show less
              </button>
            ) : null}
            <Link
              href="/applications"
              className="text-[12px] font-semibold text-muted transition-colors hover:text-accent"
            >
              All applications →
            </Link>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={handleDuplicate}
            className="inline-flex items-center justify-center rounded-[10px] bg-accent px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(47,107,255,0.28)] transition-colors hover:bg-[#1E54E6] disabled:opacity-60"
          >
            {pending ? "Duplicating…" : "Duplicate for new role"}
          </button>
          <Link
            href={`/tailor?base=${versionId}`}
            className="inline-flex items-center justify-center rounded-[10px] border border-[#CFE0FF] bg-white px-3.5 py-2 text-[13px] font-semibold text-[#1E54E6] transition-colors hover:border-[#2F6BFF] hover:bg-[#EEF3FF]"
          >
            Tailor to a job
          </Link>
        </div>
      </div>
    </div>
  );
}
