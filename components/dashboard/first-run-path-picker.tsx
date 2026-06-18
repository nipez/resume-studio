"use client";

import { ImportModal } from "@/components/import/import-modal";
import Link from "next/link";
import { useState } from "react";

type FirstRunPathPickerProps = {
  isStudent: boolean;
};

const PATHS = [
  {
    id: "student",
    icon: "🎓",
    title: "Student or first resume",
    description: "Clubs, sports, volunteering — guided step by step.",
    href: "/build?mode=student",
  },
  {
    id: "experienced",
    icon: "💼",
    title: "I have work experience",
    description: "Build a professional resume with the guided builder.",
    href: "/build",
  },
  {
    id: "import",
    icon: "↑",
    title: "I already have a resume",
    description: "Paste text or upload a PDF — we'll structure it for you.",
    action: "import" as const,
  },
] as const;

export function FirstRunPathPicker({ isStudent }: FirstRunPathPickerProps) {
  const [importOpen, setImportOpen] = useState(false);

  const orderedPaths = isStudent
    ? PATHS
    : [PATHS[1], PATHS[2], PATHS[0]];

  return (
    <>
      <section className="mb-7">
        <h2 className="mb-1 font-display text-[17px] font-semibold text-ink">
          How do you want to start?
        </h2>
        <p className="mb-4 text-[13.5px] text-muted">
          Pick one path — you can always import or build another version later.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {orderedPaths.map((path) => {
            if ("action" in path && path.action === "import") {
              return (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className="flex cursor-pointer flex-col rounded-2xl border border-[#E4E7EC] bg-white p-5 text-left transition-colors hover:border-accent hover:bg-[#FAFBFF]"
                >
                  <PathCardContent {...path} />
                </button>
              );
            }

            if ("href" in path) {
              return (
                <Link
                  key={path.id}
                  href={path.href}
                  className="flex flex-col rounded-2xl border border-[#E4E7EC] bg-white p-5 transition-colors hover:border-accent hover:bg-[#FAFBFF]"
                >
                  <PathCardContent {...path} />
                </Link>
              );
            }

            return null;
          })}
        </div>
      </section>
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}

function PathCardContent({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3FF] text-[18px]">
        {icon}
      </span>
      <span className="mt-3 font-display text-[15px] font-semibold text-ink">
        {title}
      </span>
      <span className="mt-1.5 text-[13px] leading-relaxed text-muted">
        {description}
      </span>
      <span className="mt-4 text-[12.5px] font-semibold text-accent">
        Choose →
      </span>
    </>
  );
}
