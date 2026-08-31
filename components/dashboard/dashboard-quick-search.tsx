"use client";

import { appStatusMeta } from "@/lib/applications/utils";
import {
  searchDashboardApps,
  searchDashboardDocs,
  type DashboardSearchApp,
  type DashboardSearchDoc,
} from "@/lib/dashboard/search";
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

type DashboardQuickSearchProps = {
  apps: DashboardSearchApp[];
  docs: DashboardSearchDoc[];
};

type SearchHit =
  | { kind: "app"; item: DashboardSearchApp }
  | { kind: "doc"; item: DashboardSearchDoc };

export function DashboardQuickSearch({ apps, docs }: DashboardQuickSearchProps) {
  const router = useRouter();
  const inputId = useId();
  const listId = `${inputId}-results`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const matchedApps = useMemo(
    () => searchDashboardApps(apps, query),
    [apps, query]
  );
  const matchedDocs = useMemo(
    () => searchDashboardDocs(docs, query),
    [docs, query]
  );
  const hits = useMemo<SearchHit[]>(
    () => [
      ...matchedApps.map((item) => ({ kind: "app" as const, item })),
      ...matchedDocs.map((item) => ({ kind: "doc" as const, item })),
    ],
    [matchedApps, matchedDocs]
  );

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

  function hrefFor(hit: SearchHit) {
    return hit.kind === "app"
      ? `/applications/${hit.item.id}`
      : `/editor/${hit.item.id}`;
  }

  function openHit(hit: SearchHit | undefined) {
    if (!hit) return;
    router.push(hrefFor(hit));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!hasQuery) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        hits.length === 0 ? 0 : Math.min(index + 1, hits.length - 1)
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
      openHit(hits[activeIndex] ?? hits[0]);
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
        Search applications by job or company
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
          showResults && hits[activeIndex]
            ? `${listId}-${hits[activeIndex].kind}-${hits[activeIndex].item.id}`
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
        placeholder="Did I apply? Search a job or company…"
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
          aria-label="Matching applications and documents"
          className="absolute z-30 mt-2 max-h-[420px] w-full overflow-auto rounded-2xl border border-border bg-white py-1.5 shadow-[0_16px_40px_rgba(15,17,22,0.12)]"
        >
          {hits.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-[13.5px] text-muted">
                No applications or documents match “{query.trim()}”
              </p>
              <Link
                href="/applications"
                className="mt-2 inline-block text-[13px] font-semibold text-accent hover:underline"
                onMouseDown={(e) => e.preventDefault()}
              >
                Open tracker
              </Link>
            </div>
          ) : (
            <>
              {matchedApps.length > 0 ? (
                <p className="px-4 pt-1.5 pb-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
                  Applications
                </p>
              ) : null}
              {matchedApps.map((app, index) => {
                const active = index === activeIndex;
                const status = appStatusMeta(app.status);
                const title = app.role.trim() || "Untitled application";
                return (
                  <Link
                    key={`app-${app.id}`}
                    id={`${listId}-app-${app.id}`}
                    role="option"
                    aria-selected={active}
                    href={`/applications/${app.id}`}
                    className={`flex items-start gap-3 px-4 py-2.5 transition-colors ${
                      active ? "bg-[#F5F2FF]" : "hover:bg-soft"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-[14px] font-semibold text-ink">
                          {title}
                        </span>
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em]"
                          style={{
                            color: status.fg,
                            background: status.bg,
                          }}
                        >
                          {status.label}
                        </span>
                        {app.archived ? (
                          <span className="rounded-md bg-[#F1F3F6] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em] text-[#6B7480]">
                            Archived
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-muted">
                        {app.company.trim() || "No company"}
                        {app.resumeName ? ` · ${app.resumeName}` : ""}
                        {" · "}
                        {formatRelativeTime(app.appliedAt)}
                      </span>
                    </span>
                  </Link>
                );
              })}

              {matchedDocs.length > 0 ? (
                <p className="px-4 pt-2 pb-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
                  Documents
                </p>
              ) : null}
              {matchedDocs.map((doc, index) => {
                const flatIndex = matchedApps.length + index;
                const active = flatIndex === activeIndex;
                return (
                  <Link
                    key={`doc-${doc.id}`}
                    id={`${listId}-doc-${doc.id}`}
                    role="option"
                    aria-selected={active}
                    href={`/editor/${doc.id}`}
                    className={`flex items-start gap-3 px-4 py-2.5 transition-colors ${
                      active ? "bg-[#F5F2FF]" : "hover:bg-soft"
                    }`}
                    onMouseEnter={() => setActiveIndex(flatIndex)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-[14px] font-semibold text-ink">
                          {doc.name}
                        </span>
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
              })}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
