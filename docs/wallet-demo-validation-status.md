# Folios Wallet Demo Validation Status

## Verified paths

| Platform | Result | Evidence |
|---|---|---|
| Apple Wallet | **Ready for a device demo** | The configured P12 bundle successfully signs a real `.pkpass` locally. The public `/wallet/apple?token=…` route issues a pass only after resolving the existing signed handoff token and confirming an `issued` CFDI. |
| Dynamic Folios QR | **Preserved** | The pass barcode carries the same signed Folios handoff URL. The integration flow test verifies that the resolver remains stable across operational and fiscal lifecycle transitions. |
| Google Wallet | **Blocked by credential material** | The currently configured service-account value does not pass RSA/PKCS#8 signing validation, so the UI honestly hides the Google Wallet action instead of presenting a false demo. |

## Current interaction contract

Apple and Google Wallet actions appear only on a public Folios handoff whose invoice status is `issued` and whose signed token is active. Proof, review, rejected, cancelled, expired, and revoked states do not receive a live Wallet issuance action. A rejected timbrado never becomes Wallet eligible.

## Required Google correction

Replace `GOOGLE_WALLET_SERVICE_ACCOUNT_JSON` with the complete, unmodified private-key JSON downloaded from Google Cloud for a service account authorized in the correct Google Wallet issuer. The object must include a PEM `private_key` beginning with `-----BEGIN PRIVATE KEY-----`. Once supplied, run:

```bash
RUN_WALLET_LIVE_CREDENTIAL_TESTS=true pnpm vitest run server/wallet/walletLiveCredentials.test.ts
```

That test performs the lightweight Google OAuth service-account authorization check and verifies Apple pass signing without logging any credential value.
