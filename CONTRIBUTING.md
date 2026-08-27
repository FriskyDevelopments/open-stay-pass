# Contributing to Open Stay Pass

Thank you for helping small hospitality operators adopt credible technology without enterprise lock-in.

## Contribution principles

Keep QR-first continuity useful with no integration. Treat Wallet, NFC, AI, PMS, and locks as optional adapters. Never add synthetic hotel testimonials, fake operator metrics, door codes, credentials, or secrets to code, fixtures, screenshots, or documentation.

## Running the project locally

Requirements: **Node 22+** and **pnpm 10** (the exact version is pinned in `package.json` under `packageManager`; `corepack enable` will honour it).

```bash
pnpm install          # also installs the git hooks via the `prepare` script
cp .env.example .env  # every value may stay empty for the zero-setup path
pnpm dev
```

Open the URL the dev server prints. Create a credential from the Operator console, then scan its QR from a second device or copy the NDEF URL into an NFC tag writer.

`.env.example` documents every variable the code reads. Only the **Core** block matters to get started — `JWT_SECRET` and `CREDENTIAL_HMAC_SECRET` each need at least 32 characters, and both signing layers deliberately fail closed rather than falling back to a weak key. Generate them with:

```bash
openssl rand -base64 48
```

Everything else (Supabase SSO, Apple/Google Wallet, platform services) is a progressive upgrade and stays cleanly disabled while empty.

### Checks

```bash
pnpm test    # vitest
pnpm check   # tsc --noEmit
pnpm build   # production build
pnpm validate  # all three
```

Two suites are opt-in because they call external services with credentials a contributor cannot have, and CI must not depend on a third party being reachable:

```bash
RUN_WALLET_LIVE_CREDENTIAL_TESTS=true pnpm vitest run server/wallet/walletLiveCredentials.test.ts
RUN_HOSTCASA_LIVE_CONNECTION_TEST=true pnpm vitest run server/hostCasaSupabaseConnection.test.ts
```

> If your shell exports `NODE_ENV=production`, the test config overrides it to `test`. Running the suite against React's production build breaks every component test.

## Commit format

This repository uses [Conventional Commits](https://www.conventionalcommits.org/), enforced by `commitlint` in a `commit-msg` git hook and again in CI on every pull request. A malformed message is rejected before the commit is created.

```
type(optional-scope): subject

optional body explaining why, wrapped at 100 columns

optional footer, e.g. BREAKING CHANGE: ... or Closes #12
```

Rules: the subject is lower-case, has no trailing period, and the whole header stays under 100 characters. Put the reasoning in the body — reviewers read *why* far more often than *what*.

### Allowed types

| Type | Use it for |
|---|---|
| `feat` | A user-visible capability |
| `fix` | A bug fix |
| `security` | A change whose primary purpose is closing a weakness |
| `docs` | Documentation only |
| `style` | Formatting, no behaviour change |
| `refactor` | Behaviour-preserving restructuring |
| `perf` | Performance |
| `test` | Tests only |
| `build` | Build system, bundling, dependencies |
| `ci` | CI configuration and workflows |
| `chore` | Housekeeping with no source or test change |
| `revert` | Reverts a previous commit |

Scopes are free-form; useful ones here are `wallet`, `credential`, `client`, `server`, `docs`, `deps`.

Good:

```
feat(wallet): issue an apple pass for issued cfdi handoffs
fix(credential): reject a tampered token before touching the database
security: fail closed when jwt_secret is missing or too short
```

Rejected:

```
Fixed stuff.                 # no type, capitalised, trailing period
feat: Added Wallet support.  # capitalised subject, trailing period
update                       # no type, no subject
```

Check a message before committing:

```bash
echo "feat(qr): render a quiet zone around the code" | pnpm commitlint
```

In a genuine emergency the hook can be bypassed with `SKIP_SIMPLE_GIT_HOOKS=1 git commit …`, but CI will still reject the commit on the pull request, so fix the message instead.

## Pull request checklist

Run `pnpm validate`. Add or update Vitest coverage for behavior changes. Preserve Spanish-first, English-controlled copy. For security-sensitive changes, describe token scope, expiry, revocation, and data-minimization implications in the pull request.

## Hardware and provider adapters

Submit a provider adapter only when its API, authorization model, lifecycle, and documentation have been verified. QR/NFC/Wallet are not a transport for lock secrets. Provider provisioning must remain external to the public credential payload.
