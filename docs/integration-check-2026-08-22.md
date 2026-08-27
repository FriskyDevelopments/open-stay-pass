# External integration check — 2026-08-22

HostCasa login source: https://hostcasa.app/login

The public HostCasa login page presents HostCasa operator/admin and guest tabs, Apple, Google, and Microsoft OAuth buttons, passkey activation, and two-step authentication. It states that the experience is protected by Supabase Auth. The delivered login bundle exposes a public Supabase project URL (`https://<HOSTCASA_SUPABASE_PROJECT_REF>.supabase.co`) and a publishable key (`sb_publishable_<REDACTED>`); this is client configuration, not a service-role credential. The concrete values are deployment configuration and are supplied through `VITE_HOSTCASA_SUPABASE_URL` and `VITE_HOSTCASA_SUPABASE_ANON_KEY` — see `.env.example`. They are deliberately not recorded in this repository.

Cloudflare API check: the configured token was available in the environment. `GET https://api.cloudflare.com/client/v4/user/tokens/verify` returned HTTP 401, while read-only zone listing returned HTTP 200 and showed both `hostcasa.app` and `folios.works`. Treat the token verification result as a credential-scope or token-validity issue; do not attempt destructive changes.

Neon MCP check: the configured Neon connector is enabled, but a read-only project search for `open stay` returned no projects. The current Open Stay Pass web project uses its provisioned MySQL/TiDB database rather than Neon. No Neon mutation was performed.
