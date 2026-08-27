# Open Stay Pass Reference Package

A framework-neutral, QR-first continuity rail that HostCasa and Folios can adopt without requiring a PMS, Wallet account, smart lock, or AI key at first run.

## What is safe to copy

One short-lived signed resolver URL can be displayed as a QR code or written to an NDEF NFC tag. It resolves to either the HostCasa arrival rail or the Folios proof-handoff rail. The carrier never stores a door code, lock credential, or permanent authorization.

## Run locally

```bash
cp .env.example .env
# set CREDENTIAL_HMAC_SECRET to a value of at least 32 characters
docker compose up --build
```

The demo server exposes `/api/demo/qr.svg`, `/api/demo/continuity/hostcasa`, and `/api/demo/continuity/folios`.

## Adapter status

| Adapter | Default | Boundary |
|---|---|---|
| QR | Ready | Signed resolver only |
| NDEF NFC | Ready | Same signed URL as QR |
| Apple / Google Wallet | Configuration required | Official issuance and device capability remain provider-gated |
| Smart lock | Provider owned | Provision, revoke, and audit stay server-to-server |
