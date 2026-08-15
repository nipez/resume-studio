import type { AuthInfo } from "@modelcontextprotocol/server";
import { getAppUrl } from "@/lib/request/app-url";
import { AGENT_API_KEY_HEADER } from "@/lib/mcp/auth-headers";
import {
  authenticateAgentRequest,
  extractAgentApiKey,
  type AgentAuthFailureReason,
} from "@/lib/mcp/auth";

type McpHttpHandler = (req: Request) => Response | Promise<Response>;

const FAILURE_DESCRIPTIONS: Record<AgentAuthFailureReason, string> = {
  agent_key_not_configured: "agent_key_not_configured",
  missing: "No authorization provided",
  invalid_token: "invalid_token",
  agent_user_not_resolved: "agent_user_not_resolved",
};

function challengeResponse(
  status: number,
  error: string,
  description: string
): Response {
  const resourceMetadataUrl = `${getAppUrl()}/.well-known/oauth-protected-resource`;
  const www = `Bearer error="${error}", error_description="${description}", scope="agent:apply", resource_metadata="${resourceMetadataUrl}"`;
  return new Response(
    JSON.stringify({ error, error_description: description }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": www,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Authorization, Content-Type, Accept, Accept-Language, x-agent-api-key, mcp-session-id, mcp-protocol-version",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      },
    }
  );
}

function failureResponse(reason: AgentAuthFailureReason): Response {
  const description = FAILURE_DESCRIPTIONS[reason];
  return challengeResponse(401, "invalid_token", description);
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, Accept, Accept-Language, x-agent-api-key, mcp-session-id, mcp-protocol-version"
  );
  headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Auth wrapper for /api/mcp that does not rely solely on mcp-handler's
 * Authorization parsing (which some proxies / hops strip). Accepts:
 * - Authorization: Bearer <AGENT_API_KEY>
 * - x-agent-api-key: <AGENT_API_KEY>
 *
 * 401 error_description values (never the raw key):
 * - agent_key_not_configured
 * - No authorization provided
 * - invalid_token
 * - agent_user_not_resolved
 */
export function withAgentKeyAuth(handler: McpHttpHandler): McpHttpHandler {
  return async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Authorization, Content-Type, Accept, Accept-Language, x-agent-api-key, mcp-session-id, mcp-protocol-version",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const token = extractAgentApiKey(req);
    let result;
    try {
      result = await authenticateAgentRequest(req, token);
    } catch {
      console.error("[mcp] unexpected auth error");
      return failureResponse("invalid_token");
    }

    if (!result.ok) {
      return failureResponse(result.reason);
    }

    if (!result.authInfo.scopes.includes("agent:apply")) {
      return challengeResponse(403, "insufficient_scope", "Insufficient scope");
    }

    (req as Request & { auth?: AuthInfo }).auth = result.authInfo;
    return withCors(await handler(req));
  };
}

export { AGENT_API_KEY_HEADER };
