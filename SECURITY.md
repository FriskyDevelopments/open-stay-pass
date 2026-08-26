# Security Policy

Do not report vulnerabilities in public issues. Email the repository maintainer through the private contact channel listed in the deployed application.

Please include the affected route or component, reproduction steps, expected security boundary, observed behavior, and any safe proof of concept. Do not include production guest data, signed tokens, raw credentials, lock codes, or private keys.

## Non-negotiable boundaries

Credentials are short-lived and revocable. QR, NDEF NFC, Wallet, and client interfaces must never contain a lock secret or permanent authorization. Sensitive actions must resolve a credential server-side and enforce signature, scope, expiry, tenant/property relation, and revocation status.
