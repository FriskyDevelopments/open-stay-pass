# Contributing to Open Stay Pass

Thank you for helping small hospitality operators adopt credible technology without enterprise lock-in.

## Contribution principles

Keep QR-first continuity useful with no integration. Treat Wallet, NFC, AI, PMS, and locks as optional adapters. Never add synthetic hotel testimonials, fake operator metrics, door codes, credentials, or secrets to code, fixtures, screenshots, or documentation.

## Pull request checklist

Run `pnpm test`, `pnpm check`, and `pnpm build`. Add or update Vitest coverage for behavior changes. Preserve Spanish-first, English-controlled copy. For security-sensitive changes, describe token scope, expiry, revocation, and data-minimization implications in the pull request.

## Hardware and provider adapters

Submit a provider adapter only when its API, authorization model, lifecycle, and documentation have been verified. QR/NFC/Wallet are not a transport for lock secrets. Provider provisioning must remain external to the public credential payload.
