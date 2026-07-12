"use client";

import { DiscoveryTargetCard } from "@/components/discovery/discovery-target-card";
import { Spinner } from "@/components/ui/spinner";
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
import { EMPTY_DISCOVERY_CRITERIA } from "@/lib/discovery/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

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

  async function handleGenerate() {
    setError("");
    setGenerating(true);
    setResult(null);
    setSavedTargetKeys(new Set());

    try {
      const res = await fetch("/api/ai/job-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria }),
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
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
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save profile");
      }
    });
  }

  function handleDeleteProfile(id: string) {
    if (!confirm("Delete this saved search profile?")) return;
    startProfileTransition(async () => {
      try {
        await deleteJobSearchProfile(id);
        if (activeProfileId === id) {
          setActiveProfileId(null);
          setCriteria(EMPTY_DISCOVERY_CRITERIA);
          setResult(null);
        }
        router.refresh();
      } catch (e) {
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

  return (
    <div className="mt-6">
      <div className="mb-6 rounded-2xl border border-[#E6E8EC] bg-[#FBFBFC] px-5 py-4">
        <p className="text-[13.5px] leading-[1.55] text-muted">
          Plan your hunt before you tailor. AI suggests companies and research steps — you validate
          on LinkedIn and career pages yourself. Saved targets flow into{" "}
          <Link href="/applications" className="font-semibold text-accent hover:underline">
            Jobs to apply to
          </Link>
          .
        </p>
        {isStudent ? (
          <p className="mt-2 text-[12.5px] text-[#8A92A0]">
            Job Discovery uses Pro AI — upgrade for full target planning.
          </p>
        ) : null}
      </div>

      {profiles.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => loadProfile(profile)}
                className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors ${
                  activeProfileId === profile.id
                    ? "border-accent bg-[#EAF1FF] text-accent"
                    : "border-[#DFE3E8] bg-white text-[#5A6573] hover:bg-[#F7F8FA]"
                }`}
              >
                {profile.name || "Untitled search"}
              </button>
              <button
                type="button"
                disabled={profilePending}
                onClick={() => handleDeleteProfile(profile.id)}
                className="cursor-pointer rounded-full px-1.5 text-[11px] text-[#9AA3AF] hover:text-[#B23B3B]"
                aria-label={`Delete ${profile.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-[#E6E8EC] bg-white p-5">
          <h2 className="font-display text-[17px] font-semibold text-ink">
            Target profile
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            Describe the roles and territory you want — like a sales rep hunting greenfield
            accounts.
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
    </div>
  );
}
