/**
 * Same-origin API proxy for the static Open Stay Pass frontend.
 *
 * The public site is a static Cloudflare Pages build, while the Express/tRPC
 * backend runs on a separate origin. Calling that origin straight from the
 * browser depends on the backend echoing CORS headers for every public
 * domain, and it splits auth cookies across two sites (the OAuth state cookie
 * is written on the page origin but the callback lands on the API origin).
 *
 * Proxying `/api/*` through the Pages origin removes both problems: the
 * browser only ever talks to one origin, cookies stay first-party, and the
 * backend can move later by changing one variable.
 */

export const DEFAULT_API_UPSTREAM = "https://staypass-pmz7aqns.manus.space";

/**
 * Path prefixes owned by the backend. `/manus-storage/*` is where the backend
 * serves uploaded media (press kit videos, poster) via a 307 to signed storage;
 * without the proxy the static SPA fallback answers those URLs with HTML.
 */
export const PROXIED_PREFIXES = ["/api/", "/manus-storage/"] as const;

export function isProxiedPath(pathname: string): boolean {
  return PROXIED_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

// Hop-by-hop and edge-only headers that must not be forwarded upstream.
const DROPPED_REQUEST_HEADERS = [
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "cf-connecting-ip",
  "cf-ipcountry",
  "cf-ray",
  "cf-visitor",
  "cf-worker",
  "x-forwarded-host",
  "x-forwarded-proto",
];

export type ApiProxyEnv = {
  STAYPASS_API_UPSTREAM?: string;
};

export function resolveUpstream(env: ApiProxyEnv | undefined): URL {
  const raw = (env?.STAYPASS_API_UPSTREAM ?? "").trim() || DEFAULT_API_UPSTREAM;
  const upstream = new URL(raw);
  if (upstream.protocol !== "https:" && upstream.hostname !== "localhost" && upstream.hostname !== "127.0.0.1") {
    throw new Error("STAYPASS_API_UPSTREAM must be an https origin");
  }
  return new URL(upstream.origin);
}

/** Remove any `Domain=` attribute so the cookie stays host-only on the page origin. */
export function stripCookieDomain(setCookie: string): string {
  return setCookie
    .split(";")
    .filter(part => !/^\s*domain\s*=/i.test(part))
    .join(";");
}

/** Rewrite absolute redirects that point at the upstream back to the page origin. */
export function rewriteLocation(location: string, upstream: URL, publicOrigin: string): string {
  try {
    const target = new URL(location, upstream);
    if (target.origin === upstream.origin) {
      return `${publicOrigin}${target.pathname}${target.search}${target.hash}`;
    }
  } catch {
    // Leave unparsable values untouched.
  }
  return location;
}

function readSetCookies(headers: Headers): string[] {
  const withGetter = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof withGetter.getSetCookie === "function") return withGetter.getSetCookie();
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

export async function proxyApiRequest(
  request: Request,
  env: ApiProxyEnv | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const incoming = new URL(request.url);
  if (!isProxiedPath(incoming.pathname)) {
    return new Response("Not found", { status: 404 });
  }

  let upstream: URL;
  try {
    upstream = resolveUpstream(env);
  } catch {
    return Response.json({ error: "API upstream is misconfigured" }, { status: 502 });
  }

  const target = new URL(`${incoming.pathname}${incoming.search}`, upstream);

  const headers = new Headers(request.headers);
  for (const name of DROPPED_REQUEST_HEADERS) headers.delete(name);
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", incoming.protocol.replace(":", ""));
  const clientIp = request.headers.get("cf-connecting-ip");
  if (clientIp) headers.set("x-forwarded-for", clientIp);

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetchImpl(target.toString(), {
      method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
    });
  } catch {
    return Response.json({ error: "API upstream is unreachable" }, { status: 502 });
  }

  const responseHeaders = new Headers();
  upstreamResponse.headers.forEach((value, name) => {
    const lower = name.toLowerCase();
    // CORS headers are meaningless on a same-origin response; Set-Cookie is re-added below.
    if (lower === "set-cookie" || lower.startsWith("access-control-")) return;
    if (lower === "content-length" || lower === "content-encoding" || lower === "transfer-encoding") return;
    responseHeaders.set(name, value);
  });
  for (const cookie of readSetCookies(upstreamResponse.headers)) {
    responseHeaders.append("set-cookie", stripCookieDomain(cookie));
  }
  const location = upstreamResponse.headers.get("location");
  if (location) responseHeaders.set("location", rewriteLocation(location, upstream, incoming.origin));
  if (!responseHeaders.has("cache-control")) responseHeaders.set("cache-control", "no-store");

  return new Response(method === "HEAD" ? null : upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}
