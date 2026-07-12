export type DiscoveryCriteria = {
  name: string;
  roleTitles: string;
  location: string;
  industry: string;
  companySize: string;
  keywords: string;
  territoryNotes: string;
  mustHave: string;
  exclude: string;
};

export type DiscoveryTarget = {
  company: string;
  role: string;
  rationale: string;
  researchSteps: string[];
  linkedinSearch: string;
  careersHint: string;
  priority: "high" | "medium" | "low";
};

export type DiscoveryResult = {
  summary: string;
  linkedinQueries: string[];
  searchTips: string[];
  targets: DiscoveryTarget[];
};

export type JobSearchProfile = {
  id: string;
  user_id: string;
  name: string;
  criteria: DiscoveryCriteria;
  created_at: string;
  updated_at: string;
};

export type SaveDiscoveryProfileInput = {
  id?: string;
  criteria: DiscoveryCriteria;
};

export const EMPTY_DISCOVERY_CRITERIA: DiscoveryCriteria = {
  name: "",
  roleTitles: "",
  location: "",
  industry: "",
  companySize: "",
  keywords: "",
  territoryNotes: "",
  mustHave: "",
  exclude: "",
};
