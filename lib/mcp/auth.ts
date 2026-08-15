import { timingSafeEqual } from "crypto";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { createServiceClient } from "@/lib/supabase/server";

export type AgentAuthExtra = {
  userId: string;
  email: string;
};

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

/**
 * Resolve the single user this agent key acts as.
 * Prefer AGENT_USER_ID (trusted env scope). AGENT_USER_EMAIL is a fallback
 * lookup via Auth Admin when ID is unset.
 */
async function resolveAgentUser(): Promise<AgentAuthExtra | null> {
  const userId = process.env.AGENT_USER_ID?.trim();
  const emailEnv = process.env.AGENT_USER_EMAIL?.trim()?.toLowerCase();

  if (userId) {
    if (!UUID_RE.test(userId)) {
      console.error("[mcp] AGENT_USER_ID must be a user UUID");
      return null;
    }
    // Env-scoped identity is enough for v1. Best-effort enrich email from Auth.
    let email = emailEnv || "";
    try {
      const supabase = createServiceClient();
      const { data } = await supabase.auth.admin.getUserById(userId);
      if (data?.user?.email) email = data.user.email.toLowerCase();
    } catch {
      // Supabase may be down during local smoke tests; ID from env still scopes tools.
    }
    if (!email) email = "agent@localhost";
    return { userId, email };
  }

  if (!emailEnv) {
    console.error(
      "[mcp] AGENT_USER_ID or AGENT_USER_EMAIL must be set with AGENT_API_KEY"
    );
    return null;
  }

  try {
    const supabase = createServiceClient();
    for (let page = 1; page <= 20; page += 1) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) {
        console.error("[mcp] Failed to look up AGENT_USER_EMAIL");
        return null;
      }
      const users = data.users ?? [];
      const match = users.find((u) => (u.email ?? "").toLowerCase() === emailEnv);
      if (match) {
        return {
          userId: match.id,
          email: (match.email ?? emailEnv).toLowerCase(),
        };
      }
      if (users.length < 200) break;
    }
  } catch {
    console.error("[mcp] Supabase unavailable while resolving AGENT_USER_EMAIL");
    return null;
  }

  console.error("[mcp] AGENT_USER_EMAIL did not match a user");
  return null;
}

/**
 * Verify Authorization: Bearer <AGENT_API_KEY>.
 * Never logs the raw key.
 */
export async function verifyAgentApiKey(
  _req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  const expected = configuredAgentKey();
  if (!expected) {
    console.error("[mcp] AGENT_API_KEY is not configured");
    return undefined;
  }
  if (!bearerToken || !safeEqualString(bearerToken, expected)) {
    return undefined;
  }

  const user = await resolveAgentUser();
  if (!user) return undefined;

  return {
    token: "agent",
    clientId: user.userId,
    scopes: ["agent:apply"],
    extra: user,
  };
}

export function agentUserFromAuth(
  authInfo: AuthInfo | undefined
): AgentAuthExtra | null {
  const extra = authInfo?.extra as AgentAuthExtra | undefined;
  if (!extra?.userId || !extra?.email) return null;
  return { userId: extra.userId, email: extra.email };
}
