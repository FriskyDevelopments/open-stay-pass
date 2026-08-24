# Vercel QR Generator Comparison

## Scope

This note records the comparison between the uploaded `vercel-qr-generator.zip` package and the Open Stay Pass QR implementation. The goal was to identify reusable presentation and export patterns without weakening Open Stay Pass’s signed, revocable arrival and Folios handoff links.

## Observed patterns in the Vercel package

The archive is a Next.js client-side QR generator organized around `components/qr-code-generator/`. Its main patterns are a mode selector for URL and Wi-Fi payloads, typed payload builders, a canvas-backed QR display, theme-aware styling, and explicit export actions. The generator also supports a branded export canvas with a border, center mark, caption, and a QR-only export path. The package includes `qrcode`, `lucide-react`, Tailwind/shadcn UI primitives, and separate URL/Wi-Fi input components.

| Pattern | Open Stay Pass decision | Reason |
|---|---|---|
| Canvas-backed QR rendering | Already covered by the existing credential display | The current product needs a stable, readable visual credential rather than a second generator surface. |
| Explicit QR-only export | Adopted conceptually | The credential display remains suitable for saving or sharing without exposing internal metadata. |
| Branded border, perforation, grid, and stub treatment | Adopted selectively | These elements were adapted into `TicketStatusPreview` to make proof, review, issued, and cancelled states visually distinct while preserving HostCasa/Folios semantics. |
| Theme-aware colors | Already covered and extended | Open Stay Pass maps colors to invoice lifecycle state, not only light/dark mode. |
| URL and Wi-Fi generator modes | Rejected for the current MVP | Open Stay Pass issues signed arrival/handoff credentials from server procedures; arbitrary Wi-Fi payload generation would be outside the product’s trust model and scope. |
| Center logo or decorative mark | Rejected as a default | Any center mark must preserve QR error correction and must not imply that a token is trusted merely because it is branded. |
| Client-only payload generation | Rejected for signed credentials | The server remains the authority for HMAC signing, expiry, revocation, and ticket continuity. |
| Download actions | Kept as a future-compatible pattern | Export can be added around the existing signed credential, but must never create a new unsigned destination or mutate the stable dynamic link. |

## Security boundary retained in Open Stay Pass

The decoded QR text is treated as untrusted input. `QrCodeToText` accepts a decoded value only when it is a valid HTTP(S) URL on an approved HostCasa or Folios route. The operator action opens the existing signed arrival or handoff resolver; it does not parse identity from the QR text or bypass server verification. HMAC verification, expiry, revocation, and invoice-state continuity remain server-side concerns.

## Implementation outcome

The useful generator ideas were already represented or were incorporated into the real product surface: a focused QR credential display, clear state presentation, safe route filtering, and testable export-ready rendering. The package was not copied into the application because it would introduce a parallel unsigned generator and a second visual system. The comparison therefore supports reuse of patterns rather than wholesale dependency or component duplication.

## Validation evidence

The final local validation pass completed with **12 test files and 23 tests passing**, a clean TypeScript check, and a successful production build. The build continues to report only the existing Vite bundle-size advisory; it does not fail the build.
