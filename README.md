# Open Stay Pass

> **An English-first, multilingual QR hospitality credential system for small operators.**

[Open the public repository](https://github.com/FriskyDevelopments/open-stay-pass) · [Open the live MVP](https://staypass-pmz7aqns.manus.space) · [Review the English-dub press kit](https://staypass-pmz7aqns.manus.space/press-kit)

Open Stay Pass turns one signed, revocable URL into a useful guest arrival guide, Folios evidence handoff, QR code, NDEF NFC tag, and—when officially configured—Apple Wallet or Google Wallet pass. HostCasa owns guest continuity. Folios owns proof and fiscal handoff. The credential core stays portable.

## Why this exists

Small operators should not need a PMS migration, lock-provider contract, native app, or enterprise rollout to give a guest a reliable arrival experience. The default rail is a mobile-safe signed link. Integrations are progressive upgrades, never first-run requirements.

| Rail | Outcome | Starts with |
|---|---|---|
| **HostCasa** | A calm, bilingual guest arrival guide | QR or signed link |
| **Folios** | A traceable proof and CFDI handoff | The same revocable credential boundary |
| **Open Stay Pass** | Credential lifecycle, QR, NFC, Wallet adapters | Server-side signed token |

## What is real today

- **Signed QR and NDEF URL credentials** with expiry and server-side revocation.
- **Bilingual HostCasa arrival** and **Folios proof handoff** rails.
- **Dynamic CFDI lifecycle**: one link persists while proof, review, issued, cancelled, rejected, or expired state changes.
- **Apple Wallet `.pkpass` issuance** for active issued CFDIs when an official Pass Type ID certificate is configured.
- **Google Wallet adapter contract** that stays hidden until a valid issuer and service-account private key can sign.
- **Smart-lock boundary** that keeps provisioning with HostCasa/a verified provider and never puts door secrets in QR, NFC, Wallet, or browser state.

## Verify a clone

```bash
pnpm install --frozen-lockfile
pnpm validate
```

This command runs the full regression suite, type-check, and production build without committing or copying deployment credentials. The public [live MVP](https://staypass-pmz7aqns.manus.space) is the quickest way to explore the complete QR-first operator flow.

## Run the full stack locally

The full application intentionally requires an owner-provisioned local environment because it validates signing, identity, storage, and deployment settings at startup. Configure those values through your own private secret manager or deployment platform—never by committing a `.env` file or embedding values in docs—then run:

```bash
pnpm dev
```

Use the Operator console to create a credential, then scan its QR from a second device or copy the NDEF URL to an NFC tag writer.

The repository includes a locked GitHub Actions validation workflow for pushes and pull requests to `main`. Once the public release is synchronized, its status appears under the repository’s **Actions** tab; the badge is deliberately added only after its first public run exists.

When a public `VITE_GITHUB_REPOSITORY_URL` is configured, successful test and build commands print a non-blocking invitation to star the repository. It never changes exit codes or blocks local development.

## Security boundary

The QR, NFC tag, and Wallet barcode contain only the same short-lived signed URL. They never contain a lock PIN, BLE key, raw access token, payment data, or permanent authorization. The server re-checks signature, expected scope, expiry, tenant/property relation, and revocation before resolving a credential.

Read [the smart-lock adapter contract](docs/smart-lock-adapter-contract.md), [Wallet validation status](docs/wallet-demo-validation-status.md), and [Folios Brandbook V2 mapping](docs/folios-brandbook-v2-implementation-map.md) before connecting hardware or publishing a branded fork.

## Open-source contribution

This repository is intentionally built as a reference implementation. Good first contributions include a verified PMS/lock adapter, Spanish/English copy improvement, an accessibility audit, a reproducible Docker installation, or a tested hardware NFC-writing guide. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before opening an issue or pull request.

## Optional support

Open Stay Pass offers three optional external community-support paths: **Ko-fi**, **NOWPayments**, and **Wise Business**, using the official project destinations supplied by the maintainer. Deployment configuration may override them through `VITE_KOFI_URL`, `VITE_NOWPAYMENTS_URL`, and `VITE_WISE_URL`, but the destinations are always domain-validated. A GitHub **Star** call-to-action remains hidden until `VITE_GITHUB_REPOSITORY_URL` is a verified `https://github.com/...` repository URL. Support links are not connected to credential, Wallet, NFC, CFDI, or smart-lock authorization.

## License

MIT. See [LICENSE](LICENSE).
