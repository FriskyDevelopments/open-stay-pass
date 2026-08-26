# Folios Brandbook V2 Implementation Map

## Authoritative sources

This implementation follows the portable [Folios Design System & Brandbook V2](reference/folios-brandbook-v2.pdf) and cross-checks it against the live [Folios design system](https://compliancev0.folios.works/design-system). The live system is the canonical reference where the PDF and website differ.

## Token contract

| Brand function | Token | Product use |
|---|---:|---|
| Paper | `#F2F0E9` | Fiscal document, Wallet detail, evidence record surfaces |
| Ink | `#102526` | Authority, operational background, primary text |
| System | `#5772C7` | Process, review, transfer, and non-final action states |
| Proof | `#37CDE0` | Preserved source, QR/evidence, and traceability affordances |
| Signal | `#C6F43D` | Verification, issued/valid focal state, primary confirmation |
| Structure | `#BAC0B7` | Dividers, hierarchy, non-critical separation |
| Error exception | `#B3524A` | Rejected timbrado or blocked fiscal action; never used as decoration |

### Accessibility-derived text variants

The canonical System and Error colors are preserved as visual signals. When used as **small text on Paper**, the implementation uses `System Ink #4055A8` and `Error Ink #963F39`, derived contrast-safe counterparts that preserve their semantic hue.

| Pair | Ratio | Usage decision |
|---|---:|---|
| Ink on Paper | 14.01:1 | Primary fiscal reading and body text |
| Paper on Ink | 14.01:1 | Operational surface text |
| Ink on Signal | 12.48:1 | Issued/valid CFDI confirmation |
| Ink on Proof | 8.35:1 | Evidence and QR actions |
| System Ink on Paper | 5.97:1 | Small review/process labels |
| Error Ink on Paper | 6.00:1 | Small rejected-stamp labels |
| Structure on Ink | 8.60:1 | Metadata and separators |

The canonical Paper-on-System pairing is 3.97:1 and is limited to large text or controls; the canonical Error-on-Paper pairing is 4.36:1 and is not used for normal-sized text.

## Typography and geometry

Cormorant Garamond is the editorial display voice for decisions, titles, and documentary hierarchy. Hanken Grotesk is the precise interface voice for data, labels, navigation, and controls. The UI uses a 24 px desktop gutter, 12 px compact gutter, 4 px controls, 8 px panels, and 44 px minimum touch targets. Operational components should expose source, state, time, and next action; fiscal components should privilege document status, verification, and preserved record.

## Surface mapping

| Surface | Brandbook V2 treatment | Security/lifecycle invariant |
|---|---|---|
| Folios operational dashboard | Ink field, System process states, Proof for evidence provenance, Signal only for verified completion | No credential or private token is exposed visually |
| Public handoff | Evidence-first blocks, state chip, source/owner/timeline hierarchy | Same signed handoff token remains the resolver across state changes |
| CFDI Wallet / detail | Paper document, Ink text, Signal for valid issued CFDI | Only `issued` CFDIs can invoke Wallet issuance |
| Rejected or expired stamp | Error exception or Ink non-valid state with explicit copy and icon/text | Never becomes Wallet eligible |
| QR reader and QR credential | Proof accent and documentary labels, not neon decoration | Decoded text is still verified server-side before use |

## Motion and accessibility

The Brandbook specifies functional motion with 180 ms capture, 320 ms extraction, 480 ms validation, and 650 ms decision durations. New interface changes respect `prefers-reduced-motion`. All status semantics remain explicit in text and iconography, with tested contrast and keyboard-visible controls.
