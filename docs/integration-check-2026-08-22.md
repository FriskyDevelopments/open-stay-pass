# External integration check — 2026-08-22

HostCasa login source: https://hostcasa.app/login

The public HostCasa login page presents HostCasa operator/admin and guest tabs, Apple, Google, and Microsoft OAuth buttons, passkey activation, and two-step authentication. It states that the experience is protected by Supabase Auth. The delivered login bundle exposes the public Supabase project URL `https://vlmzocifueauzroeafxz.supabase.co` and publishable key `sb_publishable_BL9ru41SZ2d-pt1II-2Gtg_Du0Me8By`; this is client configuration, not a service-role credential.

Cloudflare API check: the configured token was available in the environment. `GET https://api.cloudflare.com/client/v4/user/tokens/verify` returned HTTP 401, while read-only zone listing returned HTTP 200 and showed both `hostcasa.app` and `folios.works`. Treat the token verification result as a credential-scope or token-validity issue; do not attempt destructive changes.

Neon MCP check: the configured Neon connector is enabled, but a read-only project search for `open stay` returned no projects. The current Open Stay Pass web project uses its provisioned MySQL/TiDB database rather than Neon. No Neon mutation was performed.
