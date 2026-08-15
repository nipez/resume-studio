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

async function resolveAgentUser(): Promise<AgentAuthExtra | null> {
  const userId = process.env.AGENT_USER_ID?.trim();
  const email = process.env.AGENT_USER_EMAIL?.trim()?.toLowerCase();

  if (!userId && !email) {
    console.error(
      "[mcp] AGENT_USER_ID or AGENT_USER_EMAIL must be set with AGENT_API_KEY"
    );
    return null;
  }

  const supabase = createServiceClient();

  if (userId) {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !data?.user) {
      console.error("[mcp] AGENT_USER_ID did not resolve to a user");
      return null;
    }
    return {
      userId: data.user.id,
      email: (data.user.email ?? email ?? "").toLowerCase(),
    };
  }

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
    const match = users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (match) {
      return {
        userId: match.id,
        email: (match.email ?? email!).toLowerCase(),
      };
    }
    if (users.length < 200) break;
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
