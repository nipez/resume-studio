import type { ResumeData } from "@/lib/types/resume";

export function createEmptyResumeData(
  name = "",
  email = ""
): ResumeData {
  return {
    name,
    headline: "",
    phone: "",
    email,
    location: "",
    linkedin: "",
    summary: "",
    skills: [],
    experience: [],
    activities: [],
    education: [],
    awards: [],
  };
}

function normalizeExperienceList(raw: unknown): ResumeData["experience"] {
  return Array.isArray(raw)
    ? raw.map((e) => ({
        company: e?.company ?? "",
        title: e?.title ?? "",
        dates: e?.dates ?? "",
        blurb: e?.blurb ?? "",
        bullets: Array.isArray(e?.bullets) ? e.bullets : [""],
      }))
    : [];
}

export function normalizeResumeData(raw: unknown): ResumeData {
  const base = createEmptyResumeData();
  if (!raw || typeof raw !== "object") return base;

  const d = raw as Partial<ResumeData>;
  return {
    name: d.name ?? base.name,
    headline: d.headline ?? base.headline,
    phone: d.phone ?? base.phone,
    email: d.email ?? base.email,
    location: d.location ?? base.location,
    linkedin: d.linkedin ?? base.linkedin,
    summary: d.summary ?? base.summary,
    skills: Array.isArray(d.skills) ? d.skills : base.skills,
    experience: Array.isArray(d.experience)
      ? normalizeExperienceList(d.experience)
      : base.experience,
    activities: Array.isArray(d.activities)
      ? normalizeExperienceList(d.activities)
      : base.activities,
    education: Array.isArray(d.education)
      ? d.education.map((ed) => ({
          school: ed?.school ?? "",
          degree: ed?.degree ?? "",
          year: ed?.year ?? "",
        }))
      : base.education,
    awards: Array.isArray(d.awards)
      ? d.awards.filter(Boolean).map(String)
      : base.awards,
  };
}
