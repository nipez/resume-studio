import { timingSafeEqual } from "crypto";
import type { AuthInfo } from "@modelcontextprotocol/server";
import {
  AGENT_API_KEY_HEADER,
  MCP_AUTHORIZATION_COPY_HEADER,
  tokenFromAuthorizationHeader,
} from "@/lib/mcp/auth-headers";
import { createServiceClient } from "@/lib/supabase/server";

export type AgentAuthExtra = {
  userId: string;
  email: string;
};

export type AgentAuthFailureReason =
  | "agent_key_not_configured"
  | "missing"
  | "invalid_token"
  | "agent_user_not_resolved";

export type AgentAuthResult =
  | { ok: true; authInfo: AuthInfo }
  | { ok: false; reason: AgentAuthFailureReason };

export {
  AGENT_API_KEY_HEADER,
  MCP_AUTHORIZATION_COPY_HEADER,
  tokenFromAuthorizationHeader,
} from "@/lib/mcp/auth-headers";

function configuredAgentKey(): string | null {
  const key = process.env.AGENT_API_KEY?.trim();
  return key || null;
}

function safeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ResolveUserOutcome =
  | { ok: true; user: AgentAuthExtra }
  | { ok: false; detail: "missing_scope" | "invalid_id" | "not_found" | "lookup_error" };

/**
 * Resolve the single user this agent key acts as.
 * Prefer AGENT_USER_ID (trusted env scope). AGENT_USER_EMAIL is a fallback
 * lookup via Auth Admin listUsers (paginated) when ID is unset.
 */
async function resolveAgentUser(): Promise<ResolveUserOutcome> {
  const userId = process.env.AGENT_USER_ID?.trim();
  const emailEnv = process.env.AGENT_USER_EMAIL?.trim().toLowerCase() || "";

  if (userId) {
    if (!UUID_RE.test(userId)) {
      console.error("[mcp] AGENT_USER_ID must be a user UUID");
      return { ok: false, detail: "invalid_id" };
    }
    // Env-scoped identity is enough for v1. Best-effort enrich email from Auth.
    let email = emailEnv;
    try {
      const supabase = createServiceClient();
      const { data } = await supabase.auth.admin.getUserById(userId);
      if (data?.user?.email) email = data.user.email.trim().toLowerCase();
    } catch {
      // Supabase may be down during local smoke tests; ID from env still scopes tools.
    }
    if (!email) email = "agent@localhost";
    return { ok: true, user: { userId, email } };
  }

  if (!emailEnv) {
    console.error(
      "[mcp] AGENT_USER_ID or AGENT_USER_EMAIL must be set with AGENT_API_KEY"
    );
    return { ok: false, detail: "missing_scope" };
  }

  try {
    const supabase = createServiceClient();
    // Auth Admin has no getUserByEmail; page through listUsers.
    // Cap pages so a huge tenant fails closed with agent_user_not_resolved.
    const perPage = 200;
    const maxPages = 50;
    for (let page = 1; page <= maxPages; page += 1) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) {
        console.error("[mcp] Failed to look up AGENT_USER_EMAIL via listUsers");
        return { ok: false, detail: "lookup_error" };
      }
      const users = data.users ?? [];
      const match = users.find(
        (u) => (u.email ?? "").trim().toLowerCase() === emailEnv
      );
      if (match) {
        return {
          ok: true,
          user: {
            userId: match.id,
            email: (match.email ?? emailEnv).trim().toLowerCase(),
          },
        };
      }
      if (users.length < perPage) {
        console.error("[mcp] AGENT_USER_EMAIL did not match a user (list exhausted)");
        return { ok: false, detail: "not_found" };
      }
    }
    console.error(
      "[mcp] AGENT_USER_EMAIL not found within listUsers page limit"
    );
    return { ok: false, detail: "not_found" };
  } catch {
    console.error("[mcp] Supabase unavailable while resolving AGENT_USER_EMAIL");
    return { ok: false, detail: "lookup_error" };
  }
}

function headerPresent(req: Request, name: string): boolean {
  const value = req.headers.get(name);
  return typeof value === "string" && value.trim().length > 0;
}

function logAuthBooleans(
  req: Request,
  extra: {
    envKeyConfigured: boolean;
    userResolved: boolean;
    reason: AgentAuthFailureReason | "ok";
  }
): void {
  console.warn(
    `[mcp] auth ${extra.reason}: authorization=${headerPresent(req, "authorization")} x-agent-api-key=${headerPresent(req, AGENT_API_KEY_HEADER)} env_key_configured=${extra.envKeyConfigured} user_resolved=${extra.userResolved}`
  );
}

/**
 * Resolve the agent API key from (in order):
 * 1. bearerToken already parsed by a wrapper
 * 2. Authorization: Bearer …
 * 3. x-agent-api-key
 * 4. x-mcp-authorization (middleware copy of Authorization)
 * Never logs the raw key.
 */
export function extractAgentApiKey(
  req: Request,
  bearerToken?: string
): string | undefined {
  if (bearerToken?.trim()) return bearerToken.trim();

  const fromAuth = tokenFromAuthorizationHeader(
    req.headers.get("authorization")
  );
  if (fromAuth) return fromAuth;

  const fromAgentHeader = req.headers.get(AGENT_API_KEY_HEADER)?.trim();
  if (fromAgentHeader) return fromAgentHeader;

  const fromCopy = tokenFromAuthorizationHeader(
    req.headers.get(MCP_AUTHORIZATION_COPY_HEADER)
  );
  if (fromCopy) return fromCopy;

  // Middleware may copy the raw key (without Bearer) into the copy header.
  const rawCopy = req.headers.get(MCP_AUTHORIZATION_COPY_HEADER)?.trim();
  if (rawCopy && !/^Bearer\s+/i.test(rawCopy)) return rawCopy;

  return undefined;
}

export function logMissingAgentAuth(req: Request): void {
  logAuthBooleans(req, {
    envKeyConfigured: Boolean(configuredAgentKey()),
    userResolved: false,
    reason: "missing",
  });
}

/**
 * Verify agent API key from Authorization Bearer and/or x-agent-api-key.
 * Returns a structured result so 401s can distinguish failure modes.
 * Never logs the raw key.
 */
export async function authenticateAgentRequest(
  req: Request,
  bearerToken?: string
): Promise<AgentAuthResult> {
  const expected = configuredAgentKey();
  const envKeyConfigured = Boolean(expected);

  if (!expected) {
    logAuthBooleans(req, {
      envKeyConfigured: false,
      userResolved: false,
      reason: "agent_key_not_configured",
    });
    return { ok: false, reason: "agent_key_not_configured" };
  }

  const provided = extractAgentApiKey(req, bearerToken);
  if (!provided) {
    logAuthBooleans(req, {
      envKeyConfigured,
      userResolved: false,
      reason: "missing",
    });
    return { ok: false, reason: "missing" };
  }

  if (!safeEqualString(provided, expected)) {
    logAuthBooleans(req, {
      envKeyConfigured,
      userResolved: false,
      reason: "invalid_token",
    });
    return { ok: false, reason: "invalid_token" };
  }

  const resolved = await resolveAgentUser();
  if (!resolved.ok) {
    logAuthBooleans(req, {
      envKeyConfigured,
      userResolved: false,
      reason: "agent_user_not_resolved",
    });
    return { ok: false, reason: "agent_user_not_resolved" };
  }

  return {
    ok: true,
    authInfo: {
      token: "agent",
      clientId: resolved.user.userId,
      scopes: ["agent:apply"],
      extra: resolved.user,
    },
  };
}

/** @deprecated Prefer authenticateAgentRequest for distinguishable failures. */
export async function verifyAgentApiKey(
  req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  const result = await authenticateAgentRequest(req, bearerToken);
  return result.ok ? result.authInfo : undefined;
}

export function agentUserFromAuth(
  authInfo: AuthInfo | undefined
): AgentAuthExtra | null {
  const extra = authInfo?.extra as AgentAuthExtra | undefined;
  if (!extra?.userId || !extra?.email) return null;
  return { userId: extra.userId, email: extra.email };
}
