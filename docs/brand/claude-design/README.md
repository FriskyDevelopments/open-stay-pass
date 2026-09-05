# Open Stay Pass Design System

Product brand for **Open Stay Pass** — an open-source (MIT), self-hostable guest credential rail by Frisky Developments LLC (FriskyDev). One signed, revocable URL powers a QR code, NDEF NFC tag, guest arrival guide, and Apple/Google Wallet pass.

Sources: GitHub repo [FriskyDevelopments/open-stay-pass](https://github.com/FriskyDevelopments/open-stay-pass) (see `github.md`) — notably `docs/reference/folios-brandbook-v2.txt`, `docs/folios-brandbook-v2-implementation-map.md`, `design_reference.md`; live MVP at staypass-pmz7aqns.manus.space; wolf mark SVGs supplied by the maintainer. Brand decisions were made in this project (see `BRANDING.md` and the two brand-book pages).

Open Stay Pass sits between two sibling brands: **HostCasa** (night-hospitality calm) and **Folios** (operating-ledger precision; Paper/Ink/System/Proof/Signal tokens). OSP follows the Folios token discipline — one palette, five functions — with its own accent and mark, and must never read as a generic third dashboard.

## CONTENT FUNDAMENTALS

- Voice: factual, technical, engineering confidence — "a little feral", never corporate-warm. Claims are verifiable ("No claim the product doesn't do").
- Sentence case everywhere; headlines never all-caps. Small utility labels may be letter-spaced caps (`PASS 09-472 · SIGNED`).
- Short declaratives, second person rarely; the product speaks about the credential: "One signed link. QR, NFC, Wallet. Revocable server-side."
- Metadata written with middle dots: `signed · short-lived · revocable`, `MIT · self-hostable`.
- No emoji. No exclamation marks. URLs written bare in Trace.
- Spanish/English bilingual product; marketing copy is English-first.

## VISUAL FOUNDATIONS

- Ground: near-black cool Ink `#0A1018` (never pure black). Paper `#F2F0E9` for document surfaces only.
- One saturated accent per composition — canonical **Beacon Sky `#4DA6FF`**. A single color switch is the entire hierarchy. Alternate beacons (magenta/violet/amber/coral/mint) may own a campaign or lifecycle state, one per surface, each with derived Ink/Hairline/Trace tints (see `BRANDING.md`).
- Accents NEVER appear on Paper or light fields.
- Flat, sharp, high contrast: radius 0 everywhere, no shadows for elevation (hairline borders + raised surface `#0E1620`), no glassmorphism, no stock photos, no 3D.
- Gradients are banned except **tornasol**: a metallic iridescent sweep (`--osp-tornasol`) for hero phrases, 6px pass-card holo strips, and dividers; and the **holo field** (`--osp-holo-field`) — glowing color blobs + specular sheen + foil banding — as a celebration background.
- Texture: 32px hairline grid (`--osp-grid-texture`), near-invisible; texture not pattern.
- Glow: QR only (`--osp-glow-qr`), 8–12px low opacity. Nothing else glows.
- Motion: functional, Folios durations (capture 180ms → decision 650ms); mark draws on in 480ms; shimmer 6s linear; reduced-motion freezes at 50%.
- Layout: generous dark whitespace, left-aligned; 80px safe margin on social canvases; hover = brightness lift, press = none defined yet.
- Type: Hanken Grotesk 700 headlines (tracking −2%), 400–500 body/labels; Cormorant Garamond italic for ONE accent word max.

## ICONOGRAPHY

- The brand's own **pictogram system**: eight original glyphs (`assets/picto-*.svg`) on a 64px grid, 3.5 stroke, miter joins, one color — Scan, Access, Arrival, Route, Pass, Stay, Gateway, Self-host. Use these before any external set.
- For UI needs beyond the eight, use Phosphor icons (CDN) at 1.5px-equivalent stroke — flag additions. No emoji, no icon fonts, no hand-rolled extra SVGs.
- Marks: `assets/mark-signed-stroke.svg` (canonical), `-compact` (≤32px, QR centers, EC-H knockout), `-ink` (Paper surfaces). Wolf marks (`assets/wolf-*.svg`) are the FriskyDev studio signature — corner-placed ~40px, dimmed; never headline.

## Intentional additions

- Core component set (Button, Tag, Input, PassCard) authored from the brand rules — the repo's client uses shadcn/Tailwind and was not recreated 1:1.

## Index

- `styles.css` → `tokens/` (fonts, colors, typography, spacing, effects)
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand)
- `components/core/` — Button, Tag, Input, PassCard (+ prompt.md each)
- `assets/` — marks, pictograms, wolf signatures
- `BRANDING.md` — full written brand guide; `SKILL.md` — agent skill entry
- Brand books & banners (design pages): `Open Stay Pass Brand Book v2.dc.html`, `Open Stay Pass Brand Proposal.dc.html`, `Open Stay Pass Banners.dc.html`
- UI kit (mocks to fork): `Open Stay Pass UI Kit.dc.html` — operator console + guest arrival, rebuilt from the repo client in this brand
