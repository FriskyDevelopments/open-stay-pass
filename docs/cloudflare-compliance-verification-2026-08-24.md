# Live Compliance Verification · 2026-08-24

## Scope

This verification covered the live compliance reference at [compliancev0.folios.works](https://compliancev0.folios.works/), the configured Cloudflare bearer token, and the relationship between the Folios domain and the compliance deployment.

## Findings

| Check | Result | Interpretation |
|---|---|---|
| Cloudflare token verification | `200`; active token reported by `/user/tokens/verify` | The token is valid and active. No secret value is recorded here. |
| Wrangler account discovery | Failed to retrieve account IDs | The token does not expose account memberships required by Wrangler, or its account-level scope is unavailable. |
| Cloudflare Workers route inventory | `403 Authentication error` | The token cannot list Workers routes for `folios.works`; a clean route deployment cannot be recorded with the current scope. |
| Cloudflare DNS record inventory | `403 Authentication error` | The token cannot list the requested zone DNS records even though the zone lookup is visible. |
| Compliance host | `200`, `server: Vercel` | `compliancev0.folios.works` is currently served by Vercel, not by a Cloudflare Worker route. |
| Health/auth candidates | `/health`, `/api/health`, `/auth/health`, and `/auth/hostcasa` returned `404` | The public compliance reference exposes a static/Next.js page at these paths, not the Open Stay Pass auth bridge. |
| CORS preflight | `access-control-allow-origin: *`; no `access-control-allow-credentials: true` | Public wildcard CORS is present, but credentialed browser CORS is not configured. `*` cannot be used with cookies or other credentialed requests. |

## Operational conclusion

The current token is not expired, but it is insufficient for the requested account-level deployment and Workers route verification. The compliance reference is a Vercel deployment with public wildcard CORS and no discovered health/auth API routes. It should not be treated as the credentialed backend or as proof that the Cloudflare Folios Worker is deployed.

The Open Stay Pass dynamic QR flow remains valid independently: the same signed handoff token was resolved before and after proof → review → issued transitions, and the resolver returned updated invoice state without changing the credential reference.

## Required follow-up

To complete a Cloudflare deployment smoke test, use an API token with the correct Cloudflare account selected and account-level Workers/Pages access, including Workers Scripts Edit, Workers Routes Edit, and Pages Edit as applicable. To enable credentialed browser requests, configure the actual API origin to return the exact requesting origin plus `Access-Control-Allow-Credentials: true`; do not use `Access-Control-Allow-Origin: *` for cookie-backed requests.

## Addendum — 2026-08-27 connector verification

The enabled Cloudflare account connector confirms access to `e2a7eccb24c4836847fd14d08c499bd0`: it returned 83 Worker scripts, including `folios-auth-worker`. The Folios zone `082b82d3c54b6e11e47ae05e182f577a` is accessible and maps `folios.works/auth/*` to that Worker.

Live smoke checks returned `200` at `https://folios.works/auth/health`. A `POST /auth/hostcasa` request using the deployed `accessToken` JSON field with a deliberately invalid dummy value returned `401` and `invalid_hostcasa_identity`. Stable Cloudflare Pages and compliance-origin CORS preflights separately return the exact requesting origin, credential support, expected methods, and `Vary: Origin`.

No Worker source, route, token, DNS record, or account setting was changed. The managed environment's standalone API token remains distinct from this connector and is not being used as deployment evidence.
