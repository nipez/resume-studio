import type { ApplicationStatus } from "@/lib/applications/types";

export type DashboardSearchApp = {
  id: string;
  role: string;
  company: string;
  status: ApplicationStatus;
  resumeName: string | null;
  appliedAt: string;
  archived: boolean;
};

export type DashboardSearchDoc = {
  id: string;
  name: string;
  headline: string;
  tailoredLabel: string | null;
  updatedAt: string;
  archived: boolean;
};

function tokens(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function includesField(value: string, token: string): boolean {
  return value.toLowerCase().includes(token);
}

function startsField(value: string, token: string): boolean {
  return value.trim().toLowerCase().startsWith(token);
}

/** Token-AND search: "marketing guardian" matches role+company across fields. */
export function searchDashboardApps(
  apps: DashboardSearchApp[],
  query: string
): DashboardSearchApp[] {
  const toks = tokens(query);
  if (toks.length === 0) return [];

  const scored: Array<{ app: DashboardSearchApp; score: number; at: number }> = [];

  for (const app of apps) {
    const role = app.role ?? "";
    const company = app.company ?? "";
    const resume = app.resumeName ?? "";
    const matches = toks.every(
      (token) =>
        includesField(role, token) ||
        includesField(company, token) ||
        includesField(resume, token)
    );
    if (!matches) continue;

    const first = toks[0];
    let score = 0;
    if (startsField(company, first)) score += 8;
    else if (includesField(company, first)) score += 5;
    if (startsField(role, first)) score += 4;
    else if (includesField(role, first)) score += 2;
    if (app.archived) score -= 1;
    scored.push({
      app,
      score,
      at: Date.parse(app.appliedAt) || 0,
    });
  }

  scored.sort((a, b) => b.score - a.score || b.at - a.at);
  return scored.slice(0, 8).map((row) => row.app);
}

export function searchDashboardDocs(
  docs: DashboardSearchDoc[],
  query: string
): DashboardSearchDoc[] {
  const toks = tokens(query);
  if (toks.length === 0) return [];

  const scored: Array<{ doc: DashboardSearchDoc; score: number; at: number }> = [];

  for (const doc of docs) {
    const name = doc.name ?? "";
    const headline = doc.headline ?? "";
    const tailored = doc.tailoredLabel ?? "";
    const matches = toks.every(
      (token) =>
        includesField(name, token) ||
        includesField(headline, token) ||
        includesField(tailored, token)
    );
    if (!matches) continue;

    const first = toks[0];
    let score = 0;
    if (startsField(name, first)) score += 6;
    else if (includesField(name, first)) score += 3;
    if (includesField(tailored, first)) score += 4;
    if (doc.archived) score -= 1;
    scored.push({
      doc,
      score,
      at: Date.parse(doc.updatedAt) || 0,
    });
  }

  scored.sort((a, b) => b.score - a.score || b.at - a.at);
  return scored.slice(0, 6).map((row) => row.doc);
}
