type JsonRecord = Record<string, unknown>;

function upstreamMessage(text: string): string | null {
  const normalized = text.trim().toLowerCase();
  if (
    normalized.includes("upstream") ||
    normalized.includes("bad gateway") ||
    normalized.includes("gateway timeout")
  ) {
    return "Tailoring took too long and the server connection closed. Try Light depth, or try again in a moment.";
  }
  return null;
}

/** Parse a fetch Response as JSON with readable errors for proxy/plain-text failures. */
export async function parseJsonResponse<T extends JsonRecord = JsonRecord>(
  res: Response
): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error(
      res.ok
        ? "Empty response from server."
        : "Request failed — please try again."
    );
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const proxyError = upstreamMessage(trimmed);
    if (proxyError) throw new Error(proxyError);
    if (!res.ok) {
      throw new Error(trimmed.slice(0, 240) || "Request failed — please try again.");
    }
    throw new Error("Invalid response from server — please try again.");
  }
}
