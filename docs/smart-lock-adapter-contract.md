# Smart-Lock Adapter Boundary

## Purpose

Open Stay Pass treats a smart lock as an optional **physical-access adapter**. It does not turn QR, NFC, Apple Wallet, Google Wallet, or the browser into a lock credential. The same signed arrival link remains useful whether the operator has no lock integration, a HostCasa-assisted workflow, or a verified provider adapter.

## Separation of responsibilities

| Layer | Responsible system | What it may contain |
|---|---|---|
| Guest credential | Open Stay Pass | Signed, revocable arrival URL; tenant, property, and time boundary validation |
| QR / NFC tag | Physical carrier | The same signed URL only; never a PIN, BLE key, lock API token, or permanent access payload |
| Access provisioning | HostCasa or verified lock provider | Provider-specific reservation/access reference and valid time window |
| Door actuation | Lock provider / installed hardware | Actual opening, codes, mobile key, audit log, and emergency policy |

## Minimal provider-neutral contract

```ts
type SmartLockProvisionRequest = {
  propertyExternalId: string;
  stayReference: string;
  startsAt: string;
  endsAt: string;
  guestReference: string;
};

type SmartLockProvisionResult = {
  state: "design_required" | "pending" | "provisioned" | "revoked" | "error";
  externalAccessReference?: string;
  reason?: string;
};
```

The adapter receives only the minimum provider-required references. It must not return a raw door code into the QR, NFC, Wallet, public handoff, or client application state. Operators should surface a provider status, a timestamp, and a human next action rather than claiming that door access is confirmed.

## NFC guardrails

An NFC tag is an NDEF URL tag pointing to the signed arrival URL. It is a scan/tap convenience, not a credential for unlocking. Apple Wallet NFC and Google Smart Tap require separate platform approval, terminal, and update-service work; they are not implied by an NDEF URL tag. A lost or cloned tag is neutralized by server-side expiry and revocation of the signed URL.

## HostCasa integration position

HostCasa’s existing semi-solution is treated as the preferred starting point for the **provider adapter**, subject to its actual provider, API, and audit contract being verified. Open Stay Pass preserves the safe boundary above so the HostCasa flow can evolve without coupling a physical key to a public credential payload.
