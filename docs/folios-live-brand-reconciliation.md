# Folios Live Brand Reconciliation

## Reference reviewed

The live reference at [compliancev0.folios.works](https://compliancev0.folios.works/) presents Folios as a sovereign operational identity and evidence engine. Its language is documentary and systems-oriented: **“Entra información. Sale evidencia.”** The site uses an Aurora dark field for the operational narrative, restrained green for economic or positive outcomes, and a cyan/teal signal for verification and system affordances.

## Final CFDI relationship

The CFDI Wallet pass is a formal fiscal sub-layer inside the Folios system, not a new brand. The operational site remains dark Aurora and action-oriented. The fiscal pass/detail surface becomes Paper-led and documentary after timbrado. This preserves the live site’s distinction between the operational record and the official evidence it produces.

| Context | Live Folios/Aurora convention | CFDI Wallet convention |
|---|---|---|
| Operational surface | Dark green/black field, muted copy, cyan validation signal | Retained for dashboard, proof, and review states |
| Economic meaning | Green reserved for money or positive business outcome | Record Green is additionally permitted for a valid, authority-registered CFDI pass |
| Fiscal document | Evidence-forward, quiet, structured | Paper `#F5F2EC`, Ink `#111A1C`, hairline `#E4DFD3` |
| Failure or blockage | Clear blocked/attention language | Deep Red `#B3524A` for rejected timbrado; Amber Dark `#B07D22` for review/attention |
| Traceability | Live record, sources, actors, and custody | UUID/RFC/SAT fields use mono typography and an undecorated verification QR |

## Transition rule

The dashboard owns preparation, policy, validation, and next action. The fiscal detail page owns issued or cancelled evidence, SAT verification, XML/PDF access, and historical traceability. The transition must be explicit: when a folio is timbrado, the product changes visual mode from **action surface** to **evidence surface**. A rejected stamp never crosses this boundary into a Wallet pass; it stays in the operational surface with a Deep Red explanation and recovery action.

## Implementation status

`TicketStatusPreview` now exposes the CFDI tokens and maps `issued` to Record Green, `cancelled` and `expired` to Ink/Paper, `review` to Amber Dark, and `rejected` to Deep Red on Paper. The stable dynamic QR relationship remains unchanged; state changes affect meaning and presentation, not the underlying signed link.
