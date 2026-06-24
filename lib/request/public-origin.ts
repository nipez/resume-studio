/** Public site origin for redirects behind Railway/reverse proxies. */
export function getPublicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    if (host) {
      const proto =
        forwardedProto ??
        (host.includes("localhost") || host.startsWith("127.0.0.1")
          ? "http"
          : "https");
      return `${proto}://${host}`;
    }
  }

  const host = request.headers.get("host")?.split(",")[0]?.trim();
  if (host && !host.startsWith("localhost") && !host.startsWith("127.0.0.1")) {
    const proto = forwardedProto ?? "https";
    return `${proto}://${host}`;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    try {
      return new URL(siteUrl).origin;
    } catch {
      // fall through
    }
  }

  return new URL(request.url).origin;
}
