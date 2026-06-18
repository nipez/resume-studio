"use client";

import { ImportModal } from "@/components/import/import-modal";
import { setFirstRunPersona } from "@/lib/profile/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type FirstRunPathPickerProps = {
  isStudent: boolean;
};

const PATHS = [
  {
    id: "student" as const,
    icon: "🎓",
    title: "Student or first resume",
    description: "Clubs, sports, volunteering — guided step by step.",
    path: "student" as const,
    href: "/build?mode=student",
  },
  {
    id: "experienced" as const,
    icon: "💼",
    title: "I have work experience",
    description: "Build a professional resume with the guided builder.",
    path: "professional" as const,
    href: "/build",
  },
  {
    id: "import" as const,
    icon: "↑",
    title: "I already have a resume",
    description: "Paste text or upload a PDF — we'll structure it for you.",
    path: "import" as const,
    action: "import" as const,
  },
];

export function FirstRunPathPicker({ isStudent }: FirstRunPathPickerProps) {
  const router = useRouter();
  const [importOpen, setImportOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const orderedPaths = isStudent
    ? PATHS
    : [PATHS[1], PATHS[2], PATHS[0]];

  function choosePath(
    path: "student" | "professional" | "import",
    href: string
  ) {
    setError("");
    startTransition(async () => {
      try {
        await setFirstRunPersona(path);
        router.push(href);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save your choice");
      }
    });
  }

  function openImport() {
    setError("");
    startTransition(async () => {
      try {
        await setFirstRunPersona("import");
        setImportOpen(true);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save your choice");
      }
    });
  }

  return (
    <>
      <section className="mb-7">
        <h2 className="mb-1 font-display text-[17px] font-semibold text-ink">
          How do you want to start?
        </h2>
        <p className="mb-4 text-[13.5px] text-muted">
          Pick one path — we&apos;ll remember it and tailor the app for you.
        </p>
        {error ? (
          <p className="mb-3 text-[13px] font-medium text-[#B23B3B]">{error}</p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-3">
          {orderedPaths.map((path) => {
            if (path.action === "import") {
              return (
                <button
                  key={path.id}
                  type="button"
                  disabled={pending}
                  onClick={openImport}
                  className="flex cursor-pointer flex-col rounded-2xl border border-[#E4E7EC] bg-white p-5 text-left transition-colors hover:border-accent hover:bg-[#FAFBFF] disabled:opacity-60"
                >
                  <PathCardContent {...path} pending={pending} />
                </button>
              );
            }

            return (
              <button
                key={path.id}
                type="button"
                disabled={pending}
                onClick={() => choosePath(path.path, path.href)}
                className="flex cursor-pointer flex-col rounded-2xl border border-[#E4E7EC] bg-white p-5 text-left transition-colors hover:border-accent hover:bg-[#FAFBFF] disabled:opacity-60"
              >
                <PathCardContent {...path} pending={pending} />
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] text-muted">
          Already started?{" "}
          <Link href="/build" className="font-semibold text-accent hover:underline">
            Open the builder
          </Link>
        </p>
      </section>
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}

function PathCardContent({
  icon,
  title,
  description,
  pending,
}: {
  icon: string;
  title: string;
  description: string;
  pending?: boolean;
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
        {pending ? "Saving…" : "Choose →"}
      </span>
    </>
  );
}
