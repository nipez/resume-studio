import { LibraryActions } from "@/components/library/library-actions";
import { VersionCard } from "@/components/library/version-card";
import { getApplicationCountsByVersion } from "@/lib/applications/actions";
import { getLibraryData } from "@/lib/resume/actions";
import Link from "next/link";

export default async function LibraryPage() {
  const [{ versions, defaultVersionId }, versionCounts] = await Promise.all([
    getLibraryData(),
    getApplicationCountsByVersion(),
  ]);
  const hasVersions = versions.length > 0;

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[1120px] px-12 pb-16 pt-[42px]">
        <div className="mb-[30px] flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-[30px] font-semibold tracking-[-0.025em] text-ink">
              Resume Library
            </h1>
            <p className="mt-2 max-w-[560px] text-[14.5px] leading-relaxed text-muted">
              Keep a set of resume cuts for different roles. Duplicate one to
              riff on it, or tailor a fresh version to a specific job
              description.
            </p>
          </div>
          <LibraryActions />
        </div>

        {!hasVersions ? (
          <Link
            href="/build?mode=student"
            className="mb-[22px] flex items-center gap-[18px] rounded-2xl bg-gradient-to-br from-sidebar to-[#1b2740] px-[22px] py-[19px] text-white transition-shadow hover:shadow-[0_14px_36px_rgba(15,17,22,0.22)]"
          >
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px] bg-gradient-to-br from-accent to-[#7A53FF] text-[23px] shadow-[0_6px_18px_rgba(47,107,255,0.4)]">
              ✎
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[16.5px] font-semibold">
                No resume yet — or want a fresh start?
              </div>
              <div className="mt-[3px] text-[13.3px] leading-[1.5] text-[#AEB6C2]">
                Don&apos;t love the one you have, or starting from a blank page?
                I&apos;ll guide you through it one small step at a time. It&apos;s
                easier than it feels.
              </div>
            </div>
            <div className="flex-none whitespace-nowrap rounded-[11px] bg-white px-[18px] py-[11px] text-[13.5px] font-semibold text-ink">
              Build step by step →
            </div>
          </Link>
        ) : null}

        {hasVersions ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(330px,1fr))] gap-[18px]">
            {versions.map((version) => (
              <VersionCard
                key={version.id}
                version={version}
                isDefault={version.id === defaultVersionId}
                appCount={versionCounts[version.id] ?? 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
            <p className="text-[14px] text-muted">
              No resume versions yet. Click{" "}
              <span className="font-semibold text-ink">+ New version</span> to
              create your first one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
