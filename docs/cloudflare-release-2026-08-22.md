# Cloudflare release record — 2026-08-22

## Architecture

The current production arrangement is intentionally hybrid. The Open Stay Pass React frontend is deployed to Cloudflare Pages under the dedicated project `open-stay-pass`. Its API and server-side credential/session logic continue to run on the existing Open Stay Pass backend at `https://staypass-pmz7aqns.manus.space`. The Pages build uses `VITE_OPEN_STAY_API_ORIGIN` to target that backend. The Folios auth Worker remains mounted at `https://folios.works/auth/*` and exposes the HostCasa session bridge at `POST /auth/hostcasa`.

## Current deployment

The latest Cloudflare Pages production deployment is `b2e9a988-3adc-4461-965e-05f222c81eb9`, available at `https://b2e9a988.open-stay-pass.pages.dev`. It was uploaded from Open Stay Pass source checkpoint `7420ab9`. The browser session reached the URL successfully and reported the expected page title, `Open Stay Pass — HostCasa + Folios`. Wrangler deployment metadata reports the deployment as Production on branch `main`.

## Rollback

The previous Pages deployment is `fdc85193-5c79-4eb3-8c8a-627e61e3ede8`, available at `https://fdc85193.open-stay-pass.pages.dev`. To roll back, use the Cloudflare Pages dashboard for project `open-stay-pass`, open deployment `fdc85193-5c79-4eb3-8c8a-627e61e3ede8`, and select the production rollback action. The current application checkpoint is also restorable through `manus-webdev://73dd8e22`.

## Verification

The live Pages URL loaded successfully in the browser session. The Folios production worker returned HTTP 200 for `/auth/health`. The new `/auth/hostcasa` endpoint returned HTTP 401 for an intentionally invalid access token, confirming that the route is live and fails closed. Cloudflare Pages production bindings are present for `VITE_OPEN_STAY_API_ORIGIN`, `VITE_HOSTCASA_SUPABASE_URL`, and `VITE_HOSTCASA_SUPABASE_ANON_KEY`.

Two items remain external operational follow-up: credentialed CORS from the Pages origin could not be tested with sandbox curl because the Manus custom-domain endpoint returned a TLS protocol error, and Wrangler reported insufficient permission for Cloudflare Workers route listing/update even though the Folios route is serving the new endpoint. No destructive Cloudflare changes were made.
