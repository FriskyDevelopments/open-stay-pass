# Open Stay Pass Awwwards-Readiness Checklist

## Positioning standard

Open Stay Pass should feel like a **proof-carrying hospitality credential**, not generic property-management software. The visual system must express a real technical boundary at every moment: QR and NFC are Proof carriers, the server resolves a signed credential, Folios preserves fiscal state, and smart-lock provisioning stays external.

## Quality gates

| Criterion | Release standard | Evidence to verify |
|---|---|---|
| Visual ownership | Folios Brandbook V2 semantic tokens are used consistently: Ink authority, Paper record, System process, Proof provenance, Signal decision | `ideas.md`, token map, screenshot review |
| Product proof | The hero and promo explain an actual QR → NFC → resolver → Folios lifecycle | Public demo, integration tests, no fabricated hardware claim |
| Motion | Every animation communicates capture, extraction, validation, or decision; no decorative motion competes with the credential | 180/320/480/650 ms Brandbook motion cadence; reduced-motion fallback |
| Interaction | Keyboard focus, 44 px targets, visible state labels, bilingual controls, and mobile-first credential behavior | Component tests and mobile screenshots |
| Accessibility | Text uses approved contrast pairings; Signal, System, and Error are always paired with explicit label/icon meaning | Contrast map and TicketStatusPreview tests |
| Performance | Above-the-fold experience stays image-light, avoids blocking media, and defers optional campaign assets | Production build check; browser network inspection before submission |
| Technical honesty | Apple Wallet is described as real only where signing is configured; Google Wallet is credential-gated; NFC never implies physical unlock | README, Wallet validation status, smart-lock contract |
| Open-source experience | A visitor can understand the purpose, clone, validate, contribute, report security issues, and star the real repository | Public GitHub repository, README, templates, governance files |

## Final presentation test

The user should be able to answer these questions in under one minute: **What is it?** A signed hospitality credential. **Why is it different?** One QR/NFC link survives arrival and fiscal handoff. **Why trust it?** Revocation and provider boundaries are explicit. **What can I do?** Run the demo, audit the code, fork it, or star it if useful.

## Non-negotiable anti-patterns

Do not add invented customer metrics, mock testimonials, decorative lock-unlock flows, star-count claims, neon status decoration, generic AI-dashboard cards, or visual states that imply physical access is granted from an NFC tag. If a capability is credential-gated, represent it as pending or configuration required.

## Reference

[Folios Compliance Brandbook V2](https://compliancev0.folios.works/catalog/brandbook-v2.pdf) and the live [Folios Design System](https://compliancev0.folios.works/design-system#brand) define the canonical token and surface rules.
