"use client";

import { DiscoveryTargetCard } from "@/components/discovery/discovery-target-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Toast } from "@/components/ui/toast";
import { parseJsonResponse } from "@/lib/api/parse-response";
import {
  deleteJobSearchProfile,
  saveJobSearchProfile,
} from "@/lib/discovery/actions";
import type {
  DiscoveryCriteria,
  DiscoveryResult,
  JobSearchProfile,
} from "@/lib/discovery/types";
import { parseDiscoveryQuery } from "@/lib/discovery/parse-query";
import { EMPTY_DISCOVERY_CRITERIA } from "@/lib/discovery/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const TRY_QUERIES = [
  "Product Designer near New York",
  "Remote product designer with Figma",
  "Business Analyst Manager roles paying around $80k",
];

const fieldClass =
  "rounded-[9px] border border-[#DFE3E8] px-[11px] py-2.5 text-sm text-ink focus:border-accent focus:outline-none";

type DiscoveryPanelProps = {
  profiles: JobSearchProfile[];
  isStudent?: boolean;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
      {label}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${fieldClass} resize-y`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={fieldClass}
        />
      )}
    </label>
  );
}

export function DiscoveryPanel({ profiles, isStudent = false }: DiscoveryPanelProps) {
  const router = useRouter();
  const [criteria, setCriteria] = useState<DiscoveryCriteria>(EMPTY_DISCOVERY_CRITERIA);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [savedTargetKeys, setSavedTargetKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [copiedQuery, setCopiedQuery] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [profilePending, startProfileTransition] = useTransition();
  const [deleteProfileId, setDeleteProfileId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [heroQuery, setHeroQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (profiles.length > 0 && !activeProfileId) {
      const latest = profiles[0];
      setActiveProfileId(latest.id);
      setCriteria(latest.criteria);
    }
  }, [profiles, activeProfileId]);

  function updateCriteria(patch: Partial<DiscoveryCriteria>) {
    setCriteria((prev) => ({ ...prev, ...patch }));
  }

  function loadProfile(profile: JobSearchProfile) {
    setActiveProfileId(profile.id);
    setCriteria(profile.criteria);
    setResult(null);
    setSavedTargetKeys(new Set());
    setError("");
  }

  function targetKey(target: DiscoveryResult["targets"][number]) {
    return `${target.company}::${target.role}`;
  }

  async function runGenerate(nextCriteria: DiscoveryCriteria) {
    setError("");
    setGenerating(true);
    setResult(null);
    setSavedTargetKeys(new Set());

    try {
      const res = await fetch("/api/ai/job-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria: nextCriteria }),
      });
      const data = await parseJsonResponse<DiscoveryResult & { error?: string }>(res);
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate targets");
      }
      setResult({
        summary: data.summary ?? "",
        linkedinQueries: data.linkedinQueries ?? [],
        searchTips: data.searchTips ?? [],
        targets: data.targets ?? [],
      });
      setShowAdvanced(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerate() {
    await runGenerate(criteria);
  }

  function handleHeroSearch(raw?: string) {
    const text = (raw ?? heroQuery).trim();
    if (!text) {
      setError("Describe the role you want to search for.");
      return;
    }
    const parsed = parseDiscoveryQuery(text);
    setCriteria(parsed);
    setHeroQuery(text);
    void runGenerate(parsed);
  }

  function handleSaveProfile() {
    setError("");
    startProfileTransition(async () => {
      try {
        const profile = await saveJobSearchProfile({
          id: activeProfileId ?? undefined,
          criteria,
        });
        setActiveProfileId(profile.id);
        setToast("Search profile saved");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save profile");
      }
    });
  }

  function handleDeleteProfileConfirmed() {
    const id = deleteProfileId;
    if (!id) return;
    startProfileTransition(async () => {
      try {
        await deleteJobSearchProfile(id);
        if (activeProfileId === id) {
          setActiveProfileId(null);
          setCriteria(EMPTY_DISCOVERY_CRITERIA);
          setResult(null);
        }
        setDeleteProfileId(null);
        setToast("Search profile deleted");
        router.refresh();
      } catch (e) {
        setDeleteProfileId(null);
        setError(e instanceof Error ? e.message : "Failed to delete profile");
      }
    });
  }

  async function copyQuery(query: string, index: number) {
    try {
      await navigator.clipboard.writeText(query);
      setCopiedQuery(index);
      window.setTimeout(() => setCopiedQuery(null), 2000);
    } catch {
      setCopiedQuery(null);
    }
  }

  const showHero = !result && !generating && !showAdvanced;

  return (
    <div className="mt-2">
      {showHero ? (
        <section className="mx-auto flex min-h-[52vh] max-w-[720px] flex-col items-center justify-center px-2 pb-10 pt-8 text-center">
          <h2 className="font-display text-[34px] font-semibold tracking-[-0.035em] text-ink sm:text-[40px]">
            Find fresh jobs worth applying to
          </h2>
          <p className="mt-3 max-w-[520px] text-[16px] leading-relaxed text-[#7B6AAF]">
            No ghost jobs. No listings with 500 applicants. Just roles worth your time.
          </p>

          <form
            className="relative mt-8 w-full"
            onSubmit={(e) => {
              e.preventDefault();
              handleHeroSearch();
            }}
          >
            <div className="flex items-center gap-2 rounded-full border border-[#E0E3EA] bg-white py-2 pl-4 pr-2 shadow-[0_10px_40px_rgba(15,17,22,0.06)]">
              <svg
                className="h-5 w-5 flex-none text-[#7B6AAF]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder="Remote Senior Product Designer roles in Technology paying > $150k"
                aria-label="Describe the jobs you want"
                className="min-w-0 flex-1 border-none bg-transparent py-2.5 text-[14.5px] text-ink outline-none placeholder:text-[#9AA3AF]"
              />
              <button
                type="submit"
                disabled={generating}
                className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full border-none bg-teal text-white transition-transform hover:scale-[1.03] hover:bg-teal-dark disabled:opacity-60"
                aria-label="Search"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  aria-hidden
                >
                  <path d="M5 12h12" strokeLinecap="round" />
                  <path d="M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9AA3AF]">
              Try:
            </span>
            {TRY_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setHeroQuery(q);
                  handleHeroSearch(q);
                }}
                className="cursor-pointer rounded-full border border-[#E6E8EC] bg-[#F7F8FA] px-3.5 py-1.5 text-[12.5px] font-medium text-[#3a4350] transition-colors hover:border-accent/30 hover:bg-white"
              >
                {q}
              </button>
            ))}
          </div>

          {error ? <p className="mt-4 text-[13px] text-[#B23B3B]">{error}</p> : null}

          <p className="mt-8 max-w-[480px] text-[12.5px] leading-relaxed text-muted">
            AI suggests companies and LinkedIn searches — you validate them yourself. Saved
            targets go to{" "}
            <Link href="/applications" className="font-semibold text-accent hover:underline">
              My saved jobs
            </Link>
            .
            {isStudent ? (
              <>
                {" "}
                Uses Pro AI —{" "}
                <Link href="/pricing" className="font-semibold text-accent hover:underline">
                  see plans
                </Link>
                .
              </>
            ) : null}
          </p>

          <button
            type="button"
            onClick={() => setShowAdvanced(true)}
            className="mt-5 cursor-pointer border-none bg-transparent text-[13px] font-semibold text-accent hover:underline"
          >
            Or refine with detailed criteria →
          </button>
        </section>
      ) : null}

      {!showHero && generating && !result ? (
        <div className="mb-6 flex items-center justify-center rounded-2xl border border-[#E6E8EC] bg-white px-6 py-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner className="h-6 w-6 text-accent" />
            <p className="text-[13px] text-muted">Building your discovery plan…</p>
          </div>
        </div>
      ) : null}

      {profiles.length > 0 && (showAdvanced || result) ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  loadProfile(profile);
                  setShowAdvanced(true);
                }}
                className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                  activeProfileId === profile.id
                    ? "border-accent bg-[#F0ECFF] text-accent"
                    : "border-[#DFE3E8] bg-white text-[#5A6573] hover:bg-[#F7F8FA]"
                }`}
              >
                {profile.name || "Untitled search"}
              </button>
              <button
                type="button"
                disabled={profilePending}
                onClick={() => setDeleteProfileId(profile.id)}
                className="cursor-pointer rounded-full px-1.5 text-[11px] text-[#9AA3AF] hover:text-[#B23B3B]"
                aria-label={`Delete ${profile.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {(showAdvanced || result) ? (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-[#E6E8EC] bg-white p-5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="font-display text-[17px] font-semibold text-ink">
              Target profile
            </h2>
            {!result ? (
              <button
                type="button"
                onClick={() => setShowAdvanced(false)}
                className="cursor-pointer border-none bg-transparent text-[12.5px] font-semibold text-muted hover:text-ink"
              >
                Back to search
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] text-muted">
            Describe the roles and territory you want — then generate company targets.
          </p>

          <div className="mt-4 flex flex-col gap-3.5">
            <Field
              label="Profile name (optional)"
              value={criteria.name}
              onChange={(name) => updateCriteria({ name })}
              placeholder="Western Canada AE hunt"
            />
            <Field
              label="Role titles"
              value={criteria.roleTitles}
              onChange={(roleTitles) => updateCriteria({ roleTitles })}
              placeholder="Account Executive, Regional Sales Manager"
            />
            <Field
              label="Location / territory"
              value={criteria.location}
              onChange={(location) => updateCriteria({ location })}
              placeholder="Western Canada, remote Canada"
            />
            <Field
              label="Industry / vertical"
              value={criteria.industry}
              onChange={(industry) => updateCriteria({ industry })}
              placeholder="HRIS, cybersecurity, medtech"
            />
            <Field
              label="Company size"
              value={criteria.companySize}
              onChange={(companySize) => updateCriteria({ companySize })}
              placeholder="Series B–D, 100–500 employees"
            />
            <Field
              label="Keywords / solutions"
              value={criteria.keywords}
              onChange={(keywords) => updateCriteria({ keywords })}
              placeholder="HCM, payroll, benefits admin"
            />
            <Field
              label="Territory / competitive notes"
              value={criteria.territoryNotes}
              onChange={(territoryNotes) => updateCriteria({ territoryNotes })}
              placeholder="Companies with no AE in BC/AB yet"
              multiline
            />
            <Field
              label="Must have"
              value={criteria.mustHave}
              onChange={(mustHave) => updateCriteria({ mustHave })}
              placeholder="Open role posted, greenfield territory"
            />
            <Field
              label="Exclude"
              value={criteria.exclude}
              onChange={(exclude) => updateCriteria({ exclude })}
              placeholder="Agencies, companies I already applied to"
            />
          </div>

          {error ? <p className="mt-3 text-[12.5px] text-[#B23B3B]">{error}</p> : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={generating}
              onClick={handleGenerate}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border-none bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {generating && <Spinner className="h-4 w-4" />}
              {generating ? "Planning search…" : "✦ Generate targets"}
            </button>
            <button
              type="button"
              disabled={profilePending}
              onClick={handleSaveProfile}
              className="inline-flex cursor-pointer items-center rounded-[10px] border border-[#DFE3E8] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#3a4350] transition-colors hover:bg-[#F7F8FA] disabled:opacity-60"
            >
              {profilePending ? "Saving…" : "Save profile"}
            </button>
          </div>
        </section>

        <section>
          {!result && !generating ? (
            <div className="rounded-2xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-6 py-10 text-center">
              <p className="font-display text-[16px] font-semibold text-ink">
                Your research plan appears here
              </p>
              <p className="mx-auto mt-2 max-w-[360px] text-[13px] leading-[1.55] text-muted">
                Fill in your target profile and generate company ideas, LinkedIn search strings,
                and a checklist — then save promising targets to your job queue.
              </p>
            </div>
          ) : null}

          {generating ? (
            <div className="flex items-center justify-center rounded-2xl border border-[#E6E8EC] bg-white px-6 py-16">
              <div className="flex flex-col items-center gap-3 text-center">
                <Spinner className="h-6 w-6 text-accent" />
                <p className="text-[13px] text-muted">Building your discovery plan…</p>
              </div>
            </div>
          ) : null}

          {result ? (
            <div className="flex flex-col gap-5">
              {result.summary ? (
                <div className="rounded-2xl border border-[#E6E8EC] bg-white p-5">
                  <h3 className="font-display text-[15px] font-semibold text-ink">Strategy</h3>
                  <p className="mt-2 text-[13px] leading-[1.55] text-muted">{result.summary}</p>
                </div>
              ) : null}

              {result.linkedinQueries.length > 0 ? (
                <div className="rounded-2xl border border-[#E6E8EC] bg-white p-5">
                  <h3 className="font-display text-[15px] font-semibold text-ink">
                    LinkedIn searches
                  </h3>
                  <p className="mt-1 text-[12px] text-[#8A92A0]">
                    Copy and paste into LinkedIn — we don&apos;t run these for you.
                  </p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {result.linkedinQueries.map((query, index) => (
                      <li
                        key={query}
                        className="flex items-start justify-between gap-3 rounded-[11px] border border-[#EEF0F3] bg-[#FCFCFD] px-3 py-2.5"
                      >
                        <span className="text-[12.5px] leading-[1.45] text-[#3a4350]">
                          {query}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyQuery(query, index)}
                          className="shrink-0 cursor-pointer text-[11px] font-semibold text-accent hover:underline"
                        >
                          {copiedQuery === index ? "Copied" : "Copy"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.searchTips.length > 0 ? (
                <div className="rounded-2xl border border-[#E6E8EC] bg-white p-5">
                  <h3 className="font-display text-[15px] font-semibold text-ink">Tips</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-[18px] text-[13px] leading-[1.55] text-muted">
                    {result.searchTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.targets.length > 0 ? (
                <div>
                  <h3 className="mb-3 font-display text-[17px] font-semibold text-ink">
                    Company targets
                  </h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
                    {result.targets.map((target) => (
                      <DiscoveryTargetCard
                        key={targetKey(target)}
                        target={target}
                        saved={savedTargetKeys.has(targetKey(target))}
                        onSaved={() =>
                          setSavedTargetKeys((prev) => {
                            const next = new Set(prev);
                            next.add(targetKey(target));
                            return next;
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
      ) : null}

      <ConfirmDialog
        open={deleteProfileId !== null}
        title="Delete this search profile?"
        description="The saved criteria are removed — jobs already saved to your queue are not affected."
        confirmLabel="Delete"
        danger
        pending={profilePending}
        onConfirm={handleDeleteProfileConfirmed}
        onCancel={() => setDeleteProfileId(null)}
      />
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
