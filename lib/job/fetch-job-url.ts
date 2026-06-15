import { lookup } from "dns/promises";
import { isIP } from "net";

const MAX_BODY_BYTES = 1_000_000;
const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google",
]);

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip === "0.0.0.0") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip.startsWith("fe80:") || ip.startsWith("fc") || ip.startsWith("fd")) {
    return true;
  }

  const parts = ip.split(".");
  if (parts.length === 4 && parts[0] === "172") {
    const second = Number(parts[1]);
    if (second >= 16 && second <= 31) return true;
  }

  return false;
}

async function assertSafeHostname(hostname: string): Promise<void> {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".localhost")) {
    throw new Error("That URL is not allowed.");
  }

  if (isIP(host)) {
    if (isPrivateIp(host)) {
      throw new Error("That URL is not allowed.");
    }
    return;
  }

  const records = await lookup(host, { verbatim: true, all: true });
  for (const record of records) {
    if (isPrivateIp(record.address)) {
      throw new Error("That URL is not allowed.");
    }
  }
}

const BLOCKED_FETCH_HOSTS = ["indeed.com", "linkedin.com"];

const BROWSER_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function hostMatches(hostname: string, pattern: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return host === pattern || host.endsWith(`.${pattern}`);
}

export function normalizeJobPostingUrl(urlString: string): string {
  const url = new URL(urlString.trim());

  if (hostMatches(url.hostname, "indeed.com")) {
    const jk = url.searchParams.get("jk") || url.searchParams.get("vjk");
    if (jk) {
      return `https://www.indeed.com/viewjob?jk=${encodeURIComponent(jk)}`;
    }
    if (
      url.pathname === "/" ||
      url.pathname === "/jobs" ||
      url.pathname.startsWith("/jobs/")
    ) {
      throw new Error(
        "That looks like an Indeed search page. Open the job listing, then copy its URL (viewjob?jk=…) or paste the description using Paste text."
      );
    }
  }

  return url.toString();
}

function formatFetchError(url: URL, status: number): string {
  if (
    BLOCKED_FETCH_HOSTS.some((host) => hostMatches(url.hostname, host)) ||
    status === 401 ||
    status === 403
  ) {
    if (hostMatches(url.hostname, "indeed.com")) {
      return "Indeed blocks automated imports. Open the job in your browser, select all on the page (or copy the description), then switch to Paste text and parse it.";
    }
    if (hostMatches(url.hostname, "linkedin.com")) {
      return "LinkedIn blocks automated imports. Copy the job description from the page and use Paste text instead.";
    }
    return `That site blocked our import (${status}). Copy the job description from the page and use Paste text instead.`;
  }

  return `Could not fetch that page (${status}). Try Paste text with the job description copied from the page.`;
}

export async function assertSafeJobUrl(urlString: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(urlString.trim());
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP(S) URLs are supported.");
  }

  if (!url.hostname) {
    throw new Error("Enter a valid URL.");
  }

  await assertSafeHostname(url.hostname);
  return url;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 10))
    );
}

export function htmlToPlainText(html: string): string {
  let text = html;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  text = text.replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<[^>]+>/g, " ");
  text = decodeHtmlEntities(text);
  text = text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
  return text;
}

export async function fetchJobPageText(urlString: string): Promise<string> {
  const normalized = normalizeJobPostingUrl(urlString);
  let current = await assertSafeJobUrl(normalized);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect++) {
    const res = await fetch(current.toString(), {
      method: "GET",
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "manual",
    });

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) {
        throw new Error("Could not follow redirect from that URL.");
      }
      current = await assertSafeJobUrl(new URL(location, current).toString());
      continue;
    }

    if (!res.ok) {
      throw new Error(formatFetchError(current, res.status));
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_BODY_BYTES) {
      throw new Error("That page is too large to import. Paste the description instead.");
    }

    const html = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
    const plain = htmlToPlainText(html);
    if (plain.length < 120) {
      throw new Error(
        "Could not extract enough text from that page. It may require login — paste the description instead."
      );
    }

    return plain.slice(0, 30_000);
  }

  throw new Error("Too many redirects from that URL.");
}
