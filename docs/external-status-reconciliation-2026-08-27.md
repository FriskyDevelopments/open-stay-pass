# External Status Reconciliation — 2026-08-27

## Evidence boundary

This record distinguishes the current managed Open Stay Pass environment from a user-supplied report that described a separate local machine. No token value, certificate value, service-account value, or customer data was inspected or recorded.

| Area | Current managed-project evidence | Reconciled finding |
|---|---|---|
| Cloudflare API token | `GET /user/tokens/verify` returns `active`; `GET /accounts` returns an empty result; `wrangler whoami` cannot automatically retrieve account IDs | The project environment’s API token is active but cannot access an account. The local-machine OAuth report may be valid for that separate session, but it does not change this environment’s deployment capability. |
| Cloudflare CORS | Live preflight for `https://open-stay-pass.pages.dev` and the compliance origin returns the exact origin, `Access-Control-Allow-Credentials: true`, expected methods, and `Vary: Origin` | Credentialed CORS is working for the stable deployed Pages and compliance origins. Immutable preview URLs are intentionally excluded. |
| Apple Wallet | Managed readiness check reports configured signing material in a valid P12 format with a password; the prior local signer test passed | Apple Wallet is **Apple-ready** for the authenticated issuance route, subject to an issued CFDI and active signed handoff token. |
| Google Wallet | Managed readiness check reports JSON present but the embedded private key format as `unrecognized`; prior explicit live credential test could not sign | Google Wallet remains **configuration-gated**. The user-supplied report’s missing-on-disk finding is compatible with managed secrets: this project reads it from environment, not a JSON file in the repository. |
| Press kit | `client/src/pages/PressKit.tsx` exists; durable assets include one hero MP4, two vertical MP4s, three English SRTs, and poster PNG under `/home/ubuntu/webdev-static-assets`; `/press-kit` is a public route | The press kit exists in the managed project and public application. A machine-level filesystem search outside this project is not evidence that the assets are absent here. |

## Required external actions

Cloudflare Worker-route deployment needs a token or authenticated OAuth session **in this managed execution environment** with access to the correct Cloudflare account. Google Wallet needs the full, unmodified service-account private key whose PEM begins with `-----BEGIN PRIVATE KEY-----`. Neither blocker affects the zero-setup QR, NDEF NFC, HostCasa guide, Folios proof-handoff, public press kit, or Apple-ready path.
