import { AsyncLocalStorage } from "async_hooks";
import type { SessionPayload } from "@/lib/session";
import { SESSION_TTL_SECONDS } from "@/lib/session";

export type AgentUserContext = {
  userId: string;
  email: string;
};

const storage = new AsyncLocalStorage<AgentUserContext>();

/** Run server code as a specific user (used by the MCP agent API key path). */
export function runAsUser<T>(
  user: AgentUserContext,
  fn: () => Promise<T>
): Promise<T> {
  return storage.run(user, fn);
}

export function getRequestUserOverride(): SessionPayload | null {
  const store = storage.getStore();
  if (!store) return null;
  return {
    userId: store.userId,
    email: store.email,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
}
