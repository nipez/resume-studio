import type { DiscoveryCriteria } from "@/lib/discovery/types";
import { EMPTY_DISCOVERY_CRITERIA } from "@/lib/discovery/types";

/**
 * Lightweight natural-language → criteria mapping for the Find Jobs hero.
 * Intentionally heuristic — users can refine in the advanced form.
 */
export function parseDiscoveryQuery(raw: string): DiscoveryCriteria {
  const query = raw.trim().replace(/\s+/g, " ");
  if (!query) return { ...EMPTY_DISCOVERY_CRITERIA };

  let working = query;
  const locationMatch =
    working.match(/\b(?:near|in|around)\s+([A-Za-z][A-Za-z\s.',-]{1,40})$/i) ||
    working.match(/\b(?:near|in|around)\s+([A-Za-z][A-Za-z\s.',-]{1,40})\b/i);
  let location = "";
  if (locationMatch) {
    location = locationMatch[1].replace(/[.,]+$/, "").trim();
    working = working.replace(locationMatch[0], " ").replace(/\s+/g, " ").trim();
  }

  const remote = /\bremote\b/i.test(query);
  if (remote) {
    location = location ? `${location}, remote` : "Remote";
    working = working.replace(/\bremote\b/gi, " ").replace(/\s+/g, " ").trim();
  }

  const payMatch = working.match(
    /(?:paying|salary|comp)?\s*(?:around|about|>|over|under)?\s*\$?\s*(\d{2,3})\s*k\b/i
  );
  let keywords = "";
  if (payMatch) {
    keywords = `~$${payMatch[1]}k`;
    working = working.replace(payMatch[0], " ").replace(/\s+/g, " ").trim();
  }

  working = working
    .replace(/\broles?\b/gi, " ")
    .replace(/\bjobs?\b/gi, " ")
    .replace(/\bwith\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const industryMatch = working.match(/\bin\s+([A-Za-z][A-Za-z\s&/-]{2,30})$/i);
  let industry = "";
  if (industryMatch && !location) {
    industry = industryMatch[1].trim();
    working = working.replace(industryMatch[0], " ").replace(/\s+/g, " ").trim();
  }

  const roleTitles = working || query;

  return {
    ...EMPTY_DISCOVERY_CRITERIA,
    name: roleTitles.slice(0, 48),
    roleTitles,
    location,
    industry,
    keywords,
  };
}
