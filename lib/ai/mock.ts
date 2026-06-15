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

  if (prompt.includes("extracting structured job posting fields")) {
    const pageMatch = prompt.match(/PAGE TEXT:\n([\s\S]+?)\n\nReturn JSON/);
    const urlMatch = prompt.match(/SOURCE URL: (.+)\n/);
    const raw = pageMatch?.[1]?.trim() ?? "";
    const url = urlMatch?.[1]?.trim() ?? "";
    let jobCompany = "Demo Company";
    if (url) {
      try {
        const host = new URL(url).hostname.replace(/^www\./, "");
        jobCompany = host.split(".")[0] ?? jobCompany;
        jobCompany =
          jobCompany.charAt(0).toUpperCase() + jobCompany.slice(1);
      } catch {
        /* keep default */
      }
    }
    const excerpt = raw.slice(0, 1200).trim();
    return JSON.stringify({
      jobRole: "VP of Growth",
      jobCompany,
      jobDesc:
        (excerpt ||
          "Demo job description — configure ANTHROPIC_API_KEY for real URL parsing.") +
        "\n\n[Demo mode] Review these fields before tailoring.",
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

  if (prompt.includes("Assess how well this application's materials fit")) {
    return JSON.stringify({
      fitScore: 68,
      strengths: [
        "Resume summary aligns with the role's core responsibilities (demo mode).",
        "Skills section covers several keywords from the job description.",
      ],
      gaps: [
        "Demo mode — configure AI for a candid gap analysis vs the JD.",
        "Cover letter could tie outcomes more directly to this company's priorities.",
      ],
      advice:
        "Add ANTHROPIC_API_KEY for a real fit assessment tied to your materials.",
    });
  }

  if (prompt.includes("Prepare") && prompt.includes("for an interview for this role")) {
    return JSON.stringify({
      questions: [
        "Walk me through a recent project where you drove measurable outcomes.",
        "How do you prioritize when multiple stakeholders want different things?",
        "What draws you to this role and company specifically?",
        "Tell me about a time you had to learn something quickly on the job.",
      ],
      talkingPoints: [
        "Lead with a concrete win from your most relevant role (demo mode).",
        "Emphasize cross-functional collaboration if the JD mentions it.",
        "Connect your summary themes to this company's stated priorities.",
      ],
      ask: [
        "What does success look like in the first 90 days?",
        "How does this team measure impact on the business?",
      ],
    });
  }

  if (prompt.includes("Rewrite the summary/profile")) {
    return (
      "Results-driven professional with a track record of delivering measurable outcomes across cross-functional teams. " +
      "Demo mode — configure ANTHROPIC_API_KEY for a summary tailored to your real experience."
    );
  }

  if (prompt.includes("Write 3 distinct professional headline options")) {
    return JSON.stringify({
      headlines: [
        "VP Growth Marketing · Patient Acquisition & ROI (demo)",
        "Healthcare Marketing Leader · Demand Gen & MarTech (demo)",
        "Growth Executive · Full-Funnel Strategy & Analytics (demo)",
      ],
    });
  }

  if (prompt.includes("Write a concise professional headline")) {
    return "Senior Professional · Strategy & Growth (demo mode)";
  }

  if (prompt.includes("Rewrite bullets for this role")) {
    return JSON.stringify({
      blurb: "Role summary emphasizing scope and impact (demo mode).",
      bullets: [
        "Led initiatives that improved key business metrics using existing experience (demo — add API key).",
        "Partnered cross-functionally to deliver outcomes aligned to organizational priorities.",
        "Drove process improvements that increased efficiency and stakeholder satisfaction.",
      ],
    });
  }

  if (prompt.includes("Suggest 8-12 relevant skills")) {
    return JSON.stringify({
      skills: [
        "Strategic Planning",
        "Cross-Functional Leadership",
        "Data Analysis",
        "Stakeholder Management",
        "Project Management",
        "Communication",
        "Process Improvement",
        "Budget Management",
      ],
    });
  }

  if (prompt.includes("Offer 3 specific, actionable suggestions")) {
    return JSON.stringify({
      suggestions: [
        "Lead with a quantified outcome in your most recent role (demo mode).",
        "Trim skills to the 10 most relevant for your target roles.",
        "Add a one-line blurb under each role to frame scope before bullets.",
      ],
    });
  }

  if (prompt.includes("Implement this improvement suggestion")) {
    return JSON.stringify({
      summary:
        "Marketing leader with measurable patient acquisition and ROI gains across healthcare growth programs. Demo mode — configure ANTHROPIC_API_KEY for a real rewrite.",
      experience: {
        index: 0,
        blurb: "Led growth marketing with quantified acquisition outcomes (demo).",
        bullets: [
          "Increased qualified patient inquiries through integrated demand programs (demo).",
          "Optimized marketing spend with analytics-led channel mix decisions.",
        ],
      },
    });
  }

  if (prompt.includes("Answer this question about improving or positioning")) {
    return (
      "Demo mode: with AI configured, this would give specific advice grounded in your resume — " +
      "what to emphasize, what to trim, and how to strengthen weak sections without inventing facts."
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

export type ParsedJobPosting = {
  jobRole: string;
  jobCompany: string;
  jobDesc: string;
};

export function parseJobPostingFromAI(text: string): ParsedJobPosting | null {
  const j = extractJSON<Record<string, unknown>>(text);
  if (!j) return null;

  const jobRole = String(j.jobRole || "").trim();
  const jobCompany = String(j.jobCompany || "").trim();
  const jobDesc = String(j.jobDesc || "").trim();

  if (!jobDesc) return null;

  return { jobRole, jobCompany, jobDesc };
}
