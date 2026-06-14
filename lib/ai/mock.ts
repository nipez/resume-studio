import type { ResumeData } from "@/lib/types/resume";
import { extractJSON } from "@/lib/ai/extract-json";

/** Demo responses when ANTHROPIC_API_KEY is not configured. */
export function mockComplete(prompt: string): string {
  if (prompt.includes("parsing a resume into structured JSON")) {
    const match = prompt.match(/RESUME TEXT:\n([\s\S]+?)\n\nReturn JSON/);
    const raw = match?.[1]?.trim() ?? "";
    const lines = raw.split("\n").filter(Boolean);
    const name = lines[0]?.slice(0, 60) || "Imported Resume";
    return JSON.stringify({
      name,
      headline: "Professional — tailored via demo mode",
      phone: "",
      email: "",
      location: "",
      linkedin: "",
      summary:
        "Demo import — add ANTHROPIC_API_KEY for AI structuring. Content below was preserved from your paste.",
      skills: ["Communication", "Leadership", "Problem Solving"],
      experience: [
        {
          company: "Previous Employer",
          title: "Role Title",
          dates: "2020 – Present",
          blurb: "Demo placeholder — configure AI for accurate parsing.",
          bullets: lines.slice(1, 5).length
            ? lines.slice(1, 5)
            : ["Paste or upload your resume for AI to structure it."],
        },
      ],
      education: [],
    });
  }

  if (prompt.includes("Tailor the META")) {
    return JSON.stringify({
      headline: "Role-Aligned Professional · Demo Tailoring",
      summary:
        "Demo tailoring mode — this summary would be rewritten for the target role using your real experience. Configure ANTHROPIC_API_KEY for production-quality output.",
      skills: [
        "Strategic Planning",
        "Cross-Functional Leadership",
        "Data-Driven Decision Making",
        "Stakeholder Management",
        "Process Improvement",
      ],
      matchNotes:
        "Demo mode: AI would analyze the job description and emphasize your most relevant experience. Your original resume stays untouched — this saves as a new version.",
    });
  }

  if (prompt.includes("TASK (LIGHT)")) {
    const companies = Array.from(prompt.matchAll(/- (.+?) — /g)).map((m) => m[1]);
    const highlights: Record<string, string[]> = {};
    companies.slice(0, 3).forEach((co) => {
      highlights[co] = [
        "Reframed achievement aligned to the target role (demo — configure AI for real output).",
        "Highlighted relevant scope and outcomes from your existing experience.",
      ];
    });
    return JSON.stringify({ highlights });
  }

  if (prompt.includes("Rewrite ONLY these")) {
    const indices = Array.from(prompt.matchAll(/\[(\d+)\]/g)).map((m) =>
      Number(m[1])
    );
    const roles = indices.map((i) => ({
      i,
      blurb: "Role summary tuned to the job description (demo mode).",
      bullets: [
        "Bullet reframed for this role's priorities (demo — add API key for real tailoring).",
        "Emphasis on relevant outcomes from your actual experience.",
      ],
    }));
    return JSON.stringify({ roles });
  }

  if (prompt.includes("cover letter")) {
    return (
      "Dear Hiring Team,\n\n" +
      "This is a demo cover letter. With ANTHROPIC_API_KEY configured, AI will write a concise, role-specific letter in your voice using your resume and the job description.\n\n" +
      "Best regards,\n" +
      (prompt.match(/for (\w+)/)?.[1] ?? "Candidate")
    );
  }

  if (prompt.includes("job-application question")) {
    return (
      "Demo answer: with AI configured, this would be a 120–180 word response in your voice, tied to your real experience and the target role. " +
      "It will not invent facts — only reframe what is already in your resume."
    );
  }

  return "Demo AI response — configure ANTHROPIC_API_KEY for real generation.";
}

export async function completeWithFallback(prompt: string): Promise<{
  text: string;
  mock: boolean;
}> {
  const { complete, isAIConfigured } = await import("@/lib/ai/client");
  if (isAIConfigured()) {
    const text = await complete(prompt);
    return { text, mock: false };
  }
  return { text: mockComplete(prompt), mock: true };
}

export function normalizeParsedResume(j: Record<string, unknown>): ResumeData | null {
  if (!j || !(j.name || (Array.isArray(j.experience) && j.experience.length))) {
    return null;
  }
  return {
    name: String(j.name || ""),
    headline: String(j.headline || ""),
    phone: String(j.phone || ""),
    email: String(j.email || ""),
    location: String(j.location || ""),
    linkedin: String(j.linkedin || ""),
    summary: String(j.summary || ""),
    skills: Array.isArray(j.skills)
      ? j.skills.filter(Boolean).map(String)
      : [],
    experience: Array.isArray(j.experience)
      ? j.experience.map((e: Record<string, unknown>) => ({
          company: String(e.company || ""),
          title: String(e.title || ""),
          dates: String(e.dates || ""),
          blurb: String(e.blurb || ""),
          bullets: Array.isArray(e.bullets)
            ? e.bullets.filter(Boolean).map(String)
            : [],
        }))
      : [],
    education: Array.isArray(j.education)
      ? j.education.map((ed: Record<string, unknown>) => ({
          school: String(ed.school || ""),
          degree: String(ed.degree || ""),
          year: String(ed.year || ""),
        }))
      : [],
  };
}

export function parseResumeFromAI(text: string): ResumeData | null {
  const j = extractJSON<Record<string, unknown>>(text);
  if (!j) return null;
  return normalizeParsedResume(j);
}
