"use client";

import {
  searchResumeDocs,
  type ResumeSearchDoc,
} from "@/lib/resume/search";
import { formatRelativeTime } from "@/lib/resume/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type DashboardResumeSearchProps = {
  docs: ResumeSearchDoc[];
};

export function DashboardResumeSearch({ docs }: DashboardResumeSearchProps) {
  const router = useRouter();
  const inputId = useId();
  const listId = `${inputId}-results`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = useMemo(() => searchResumeDocs(docs, query), [docs, query]);
  const hasQuery = query.trim().length > 0;
  const showResults = open && hasQuery;

  useEffect(() => {
    if (window.matchMedia("(min-width: 640px)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function openMatch(id: string) {
    router.push(`/editor/${id}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!hasQuery) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        matches.length === 0 ? 0 : Math.min(index + 1, matches.length - 1)
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const target = matches[activeIndex] ?? matches[0];
      if (target) openMatch(target.id);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setQuery("");
      setOpen(false);
    }
  }

  return (
    <div className="relative mt-5 max-w-[560px]">
      <label htmlFor={inputId} className="sr-only">
        Search resumes by name
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        role="combobox"
        aria-expanded={showResults}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showResults && matches[activeIndex]
            ? `${listId}-${matches[activeIndex].id}`
            : undefined
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search resumes by name…"
        autoComplete="off"
        className="w-full rounded-[12px] border border-[#DFE3E8] bg-white py-3 pl-10 pr-10 text-[15px] text-ink shadow-[0_1px_0_rgba(26,29,35,0.03)] placeholder:text-[#9AA3AF] focus:border-accent focus:outline-none"
      />
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9AA3AF]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      {hasQuery ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setOpen(false);
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-md px-1.5 py-0.5 text-[13px] font-semibold text-[#8A92A0] hover:bg-[#F2F3F5] hover:text-ink"
        >
          ✕
        </button>
      ) : null}

      {showResults ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Matching resumes"
          className="absolute z-30 mt-2 max-h-[360px] w-full overflow-auto rounded-2xl border border-border bg-white py-1.5 shadow-[0_16px_40px_rgba(15,17,22,0.12)]"
        >
          {matches.length === 0 ? (
            <p className="px-4 py-3 text-[13.5px] text-muted">
              No resumes match “{query.trim()}”
            </p>
          ) : (
            matches.map((doc, index) => {
              const active = index === activeIndex;
              return (
                <Link
                  key={doc.id}
                  id={`${listId}-${doc.id}`}
                  role="option"
                  aria-selected={active}
                  href={`/editor/${doc.id}`}
                  className={`flex items-start gap-3 px-4 py-2.5 transition-colors ${
                    active ? "bg-[#F5F2FF]" : "hover:bg-soft"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span
                    className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[#F0ECFF] text-[12px] text-accent"
                    aria-hidden
                  >
                    ▤
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-[14px] font-semibold text-ink">
                        {doc.name}
                      </span>
                      {doc.isDefault ? (
                        <span className="rounded-md bg-[#EEF3FF] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em] text-[#1E54E6]">
                          Default
                        </span>
                      ) : null}
                      {doc.archived ? (
                        <span className="rounded-md bg-[#F1F3F6] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em] text-[#6B7480]">
                          Archived
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-muted">
                      {doc.tailoredLabel || doc.headline || "Resume"}
                      {" · "}
                      {formatRelativeTime(doc.updatedAt)}
                    </span>
                  </span>
                </Link>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
