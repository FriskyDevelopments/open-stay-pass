# Cloudflare + Supabase runbook

## 1. Create the Cloudflare token

In the owner Cloudflare console, open **My Profile → API Tokens → Create Token → Create Custom Token**. Scope the token to the account `e2a7eccb24c4836847fd14d08c499bd0` and grant the following permissions:

| Resource | Permission | Why it is needed |
|---|---|---|
| Account → Workers Scripts | Edit | Upload/update `folios-auth-worker` |
| Account → Workers Routes | Edit | Manage `folios.works/auth/*` |
| Account → Cloudflare Pages | Edit | Deploy/configure `open-stay-pass` |
| Account Settings | Read | Let Wrangler identify the account |

Do not grant Zone DNS Edit unless DNS changes are explicitly required. Restrict the token to the intended account and, when available in the console, restrict zone access to `folios.works` and `hostcasa.app`. Copy the token once; Cloudflare will not show the secret again.

## 2. Store and verify it

Store the token in the Manus session/project secret named `CLOUDFLARE_API_TOKEN`. Do not paste it into chat, source files, Git, or a `.env` committed to a repository. After saving it, run the following checks from the deployment workspace:

```bash
npx wrangler@4.125.0 whoami
npx wrangler@4.125.0 pages project list
cd /home/ubuntu/folios/workers/auth-api
npx wrangler@4.125.0 deploy --config wrangler.toml --dry-run
```

A valid result must identify account `e2a7eccb24c4836847fd14d08c499bd0`, list `open-stay-pass`, and complete the Worker dry run without error 10000. A deploy test follows only after those checks pass.

## 3. Supabase ticket-state integration

Supabase is the identity and persistence provider for the HostCasa shared login. The ticket state itself is represented in the application database on the `handoffs` record so its signed QR link remains stable while mutable invoice metadata changes. The current fields are `invoiceStatus`, `invoiceNumber`, `invoiceUrl`, `invoiceIssuedAt`, and `invoiceUpdatedAt`.

Allowed transitions are:

| State | Meaning | UI color | Allowed next states |
|---|---|---|---|
| `proof` | Initial comprobante/slip | Amber `#d9a441` | `review`, `cancelled` |
| `review` | Invoice being checked | Violet `#aa8bd8` | `issued`, `cancelled`, `proof` |
| `issued` | Invoice emitted | Emerald `#39d98a` | `cancelled` |
| `cancelled` | Invoice cancelled | Soft red `#e17878` | None |

The signed handoff credential is not regenerated during an invoice transition. The public Folios route resolves the original signed token, reads current invoice fields, and renders the state badge and privacy-safe transition history. The operator mutation enforces operator ownership and transition rules. When the state becomes `issued`, the system writes an `invoice_issued` audit event and creates a bilingual operator notification; configured project-owner push delivery is attempted, otherwise the notification remains in the in-app audit stream.

## 4. Deployment test

Once the token is updated in the session, the deployment sequence is:

```bash
cd /home/ubuntu/open-stay-pass-web
pnpm test && pnpm check && pnpm build
npx wrangler@4.125.0 pages deploy dist/public --project-name open-stay-pass --branch main
cd /home/ubuntu/folios/workers/auth-api
npx wrangler@4.125.0 deploy --config wrangler.toml
curl -sS https://folios.works/auth/health
curl -sS -X POST https://folios.works/auth/hostcasa \
  -H 'Content-Type: application/json' \
  --data '{"accessToken":"invalid-test-token"}'
```

Expected results are a successful Pages deployment, a clean Worker deployment with route update, HTTP 200 from `/auth/health`, and HTTP 401 for the intentionally invalid HostCasa token. The final production report should include the Pages deployment ID, Worker version, active routes, and rollback target.
