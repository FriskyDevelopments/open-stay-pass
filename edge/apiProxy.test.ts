import { describe, expect, it, vi } from "vitest";
import { DEFAULT_API_UPSTREAM, proxyApiRequest, resolveUpstream, rewriteLocation, stripCookieDomain } from "./apiProxy";

describe("same-origin API proxy", () => {
  it("forwards /api requests to the configured upstream with path and query", async () => {
    const fetchImpl = vi.fn(async () => Response.json([{ result: { data: { json: null } } }]));
    const request = new Request("https://staypass.dev/api/trpc/auth.me?batch=1&input=%7B%7D", {
      headers: { cookie: "app_session_id=abc", "cf-connecting-ip": "203.0.113.9", origin: "https://staypass.dev" },
    });

    const response = await proxyApiRequest(request, { STAYPASS_API_UPSTREAM: "https://api.example.test/" }, fetchImpl);

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.test/api/trpc/auth.me?batch=1&input=%7B%7D");
    const headers = new Headers(init.headers);
    expect(headers.get("cookie")).toBe("app_session_id=abc");
    expect(headers.get("x-forwarded-host")).toBe("staypass.dev");
    expect(headers.get("x-forwarded-proto")).toBe("https");
    expect(headers.get("x-forwarded-for")).toBe("203.0.113.9");
    expect(headers.has("cf-connecting-ip")).toBe(false);
    expect(init.redirect).toBe("manual");
    expect(init.body).toBeUndefined();
  });

  it("defaults to the current backend when no upstream is configured", () => {
    expect(resolveUpstream(undefined).origin).toBe(new URL(DEFAULT_API_UPSTREAM).origin);
    expect(resolveUpstream({ STAYPASS_API_UPSTREAM: "  " }).origin).toBe(new URL(DEFAULT_API_UPSTREAM).origin);
  });

  it("refuses a plain-http upstream", async () => {
    const response = await proxyApiRequest(new Request("https://staypass.dev/api/health"), { STAYPASS_API_UPSTREAM: "http://evil.test" }, vi.fn());
    expect(response.status).toBe(502);
  });

  it("forwards mutation bodies", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200, headers: { "content-type": "application/json" } }));
    const request = new Request("https://staypass.dev/api/auth/hostcasa/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accessToken: "t" }),
    });
    await proxyApiRequest(request, {}, fetchImpl);
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect(new TextDecoder().decode(init.body as ArrayBuffer)).toBe('{"accessToken":"t"}');
  });

  it("keeps cookies first-party and redirects on the page origin", async () => {
    const upstreamHeaders = new Headers({ location: `${DEFAULT_API_UPSTREAM}/operator?x=1`, "access-control-allow-origin": "*" });
    upstreamHeaders.append("set-cookie", "app_session_id=abc; Path=/; Domain=staypass-pmz7aqns.manus.space; HttpOnly; Secure; SameSite=None");
    const fetchImpl = vi.fn(async () => new Response(null, { status: 302, headers: upstreamHeaders }));

    const response = await proxyApiRequest(new Request("https://staypass.dev/api/oauth/callback?code=1&state=2"), {}, fetchImpl);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://staypass.dev/operator?x=1");
    expect(response.headers.get("set-cookie")).toBe("app_session_id=abc; Path=/; HttpOnly; Secure; SameSite=None");
    expect(response.headers.has("access-control-allow-origin")).toBe(false);
  });

  it("returns 502 instead of throwing when the upstream is down", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("network down");
    });
    const response = await proxyApiRequest(new Request("https://staypass.dev/api/trpc/x"), {}, fetchImpl);
    expect(response.status).toBe(502);
  });

  it("proxies backend media and passes signed storage redirects through", async () => {
    const signed = "https://cdn.example.test/poster.png?Signature=abc";
    const fetchImpl = vi.fn(async () => new Response(null, { status: 307, headers: { location: signed } }));
    const response = await proxyApiRequest(new Request("https://staypass.dev/manus-storage/poster.png"), {}, fetchImpl);
    const [url] = fetchImpl.mock.calls[0] as unknown as [string];
    expect(url).toBe(`${DEFAULT_API_UPSTREAM}/manus-storage/poster.png`);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(signed);
  });

  it("ignores non-api paths", async () => {
    const fetchImpl = vi.fn();
    const response = await proxyApiRequest(new Request("https://staypass.dev/operator"), {}, fetchImpl);
    expect(response.status).toBe(404);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("helpers leave foreign redirects and plain cookies alone", () => {
    const upstream = new URL(DEFAULT_API_UPSTREAM);
    expect(rewriteLocation("https://manus.im/app-auth?x=1", upstream, "https://staypass.dev")).toBe("https://manus.im/app-auth?x=1");
    expect(rewriteLocation("/", upstream, "https://staypass.dev")).toBe("https://staypass.dev/");
    expect(stripCookieDomain("a=b; Path=/")).toBe("a=b; Path=/");
  });
});
