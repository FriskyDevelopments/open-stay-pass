# HostCasa Smart-Lock Source Reconciliation

## Sources reviewed

The public `FriskyDevelopments/hostcasa` repository was reviewed alongside `FriskyDevelopments/hostcasa-platform`. The primary project consistently frames HostCasa’s guest experience through the hospitality principle **“the door is always open”**, arrival guidance, booking continuity, and ConciergeAI. A targeted source review found no implemented smart-lock provider SDK, provider credential model, PIN lifecycle, remote-unlock call, or keyless-access route. The platform repository does not add a concrete lock contract.

## Reconciliation decision

HostCasa contributes the **guest-continuity intent**: a credential should make arrival calm, clear, and useful. It does not currently supply a physical-access implementation for Open Stay Pass to reuse. Therefore, Open Stay Pass retains its provider-neutral smart-lock adapter boundary rather than inventing a HostCasa lock integration.

| Responsibility | Open Stay Pass | HostCasa | Lock provider / adapter |
|---|---|---|---|
| Signed QR / NFC / Wallet reference | Creates, resolves, expires, and revokes | Presents arrival continuity | Never receives a reusable bearer secret from a carrier |
| Arrival guide and guest context | Shares the verified link | Owns the guide and concierge experience | May receive a contextual provisioning request only after verification |
| Physical provisioning | Records adapter state only | Can display clear guest-facing status | Owns credential/PIN creation, grant, revoke, audit, and failure handling |
| Unlock authority | Never exposes it in a carrier or client bundle | Never derives it from QR/NFC/Wallet | Provider-specific, server-to-server, policy-gated |

## Follow-up trigger

When a HostCasa repository adds a named provider (for example Nuki, Yale, Salto, or TTLock), a documented API contract, or an approved server-side provisioning flow, reconcile that implementation against `docs/smart-lock-adapter-contract.md`. Until then, the public integration card must remain **Custom · Design required** and must never imply that scan, tap, Wallet, or NFC directly unlocks a door.
