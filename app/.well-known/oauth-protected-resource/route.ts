import {
  metadataCorsOptionsRequestHandler,
  protectedResourceHandler,
} from "mcp-handler";
import { getAppUrl } from "@/lib/request/app-url";

/**
 * Personal agent API keys (not OAuth). This metadata document exists so
 * MCP clients that probe RFC 9728 still get a coherent response; auth is
 * still Authorization: Bearer <AGENT_API_KEY>.
 */
const handler = protectedResourceHandler({
  authServerUrls: [getAppUrl()],
  resourceUrl: `${getAppUrl()}/api/mcp`,
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
