export const APP_SESSION_COOKIE = "app_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  email: string;
  expiresAt: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let cachedKey: Promise<CryptoKey> | null = null;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("Missing SESSION_SECRET");
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad =
    padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getHmacKey(): Promise<CryptoKey> {
  if (!cachedKey) {
    cachedKey = crypto.subtle.importKey(
      "raw",
      encoder.encode(sessionSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return cachedKey;
}

async function signPayload(encoded: string): Promise<string> {
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(encoded));
  return toBase64Url(new Uint8Array(sig));
}

async function verifyPayload(
  encoded: string,
  signature: string
): Promise<boolean> {
  try {
    const key = await getHmacKey();
    const sigBytes = new Uint8Array(fromBase64Url(signature));
    return crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(encoded)
    );
  } catch {
    return false;
  }
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const encoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${encoded}.${await signPayload(encoded)}`;
}

export async function readSession(
  value: string | undefined | null
): Promise<SessionPayload | null> {
  if (!value) return null;

  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;

  if (!(await verifyPayload(encoded, signature))) return null;

  try {
    const payload = JSON.parse(
      decoder.decode(fromBase64Url(encoded))
    ) as SessionPayload;

    if (
      !payload ||
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.expiresAt !== "number"
    ) {
      return null;
    }

    if (payload.expiresAt <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createSessionPayload(userId: string, email: string): SessionPayload {
  return {
    userId,
    email: email.toLowerCase(),
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
