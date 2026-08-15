/** Shared MCP auth header names/helpers — safe for Edge middleware (no Node crypto). */

export const AGENT_API_KEY_HEADER = "x-agent-api-key";

/** Middleware copies Authorization here so the route still sees the key if proxies strip Authorization. */
export const MCP_AUTHORIZATION_COPY_HEADER = "x-mcp-authorization";

/** Parse `Authorization: Bearer <token>` (case-insensitive scheme). */
export function tokenFromAuthorizationHeader(
  value: string | null | undefined
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const match = /^Bearer\s+(.+)$/i.exec(trimmed);
  if (match?.[1]) return match[1].trim() || undefined;
  return undefined;
}
