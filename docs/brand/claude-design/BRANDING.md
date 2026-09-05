# Open Stay Pass — Brand Guide v1

Product brand for the Open Stay Pass credential rail (by Frisky Developments LLC / FriskyDev).
Follows the Folios Brandbook V2 token discipline (`docs/reference/folios-brandbook-v2.txt`): one palette, five functions, no color without a new semantic role.

## Position

Open Stay Pass sits between HostCasa (night-hospitality calm) and Folios (operating-ledger precision). It owns the moment in between: the signed link that travels. It must stay recognizable inside both worlds without becoming a generic third-brand dashboard.

## Color tokens

| Role | Token | Hex | Use |
|---|---|---|---|
| Ink | `--osp-ink` | `#0A1018` | Field and dark surfaces (shares Folios' Ink discipline, cooled to the accent) |
| Paper | `--osp-paper` | `#F2F0E9` | Shared with Folios. Document surfaces, light text on Ink |
| Beacon | `--osp-beacon` | `#4DA6FF` | Canonical accent. Active / valid / scannable state, QR, one headline switch |
| Trace | `--osp-trace` | `#93A0AD` | Secondary text, metadata, URLs. Never dimmer |
| Hairline | `--osp-hairline` | `#1E2A3A` | Rules, dividers, structural grid texture |
| Mark dim | `--osp-mark-dim` | `#46617F` | Corner signatures (studio wolf mark) |

Rules:
- Beacon only ever appears on Ink. Never on Paper or any light field.
- Exactly one saturated color per composition. One color switch is the whole hierarchy.
- Folios Signal `#C6F43D` and FriskyDev lime `#b7ff2a` never appear on Open Stay Pass surfaces.
- Lime glow is replaced by a Beacon glow (8–12 px, low opacity) on the QR only. Nothing else glows.

### Alternate accents (sanctioned applications)

Sky is canonical (repo, README, core product). Each alternate carries its own derived Ink/Hairline/Trace and follows the same rules: one saturated color per composition, dark fields only.

| Accent | Hex | Ink | Hairline | Trace | Application |
|---|---|---|---|---|---|
| Magenta | `#FF4FD8` | `#120A11` | `#3A2136` | `#A5949F` | Launch moments, social punch |
| Violet | `#B26BFF` | `#0F0A16` | `#2C2140` | `#9C94A8` | Night / hospitality surfaces |
| Amber | `#FFB300` | `#14100A` | `#3A2F1E` | `#A89C8E` | Warnings, expiry states |
| Coral | `#FF5C38` | `#140C0A` | `#3A241E` | `#A89690` | Revoked / cancelled |
| Mint | `#2BFFC8` | `#081415` | `#22403E` | `#8FA3A0` | Issued / valid confirmation |

## Type

- **Hanken Grotesk** 700 leads every headline — tight tracking (−1.5% to −2.5%), sentence case, never all-caps. 400–500 for supporting lines, credential data, labels, URLs.
- **Cormorant Garamond** italic — one editorial accent word maximum. If in doubt, skip it.

## Mark

Canonical mark: **The Signed Stroke** — a signature dissolving into three QR modules (signed by a person, verified by a server). One canonical path, never redrawn, filled, rotated, or enclosed. Compact cut (one loop, two modules) below 32 px and in QR centers. On Paper it switches to Ink #102526.

The geometric candidates became the **pictogram system**: Scan, Access, Arrival, Route, Pass, Stay, Gateway, Self-host — 64 px grid, 3.5 stroke, miter joins, one color.
The FriskyDev wolf signs the work: small (~40 px), corner-placed, in `--osp-mark-dim`. It signs, it doesn't headline.

## Texture & effects

- Hairline grid, 32 px unit, near-invisible at full size, gone at thumbnail size. Texture, not pattern.
- Flat, high contrast, sharp edges. No gradient meshes, no glassmorphism, no rounded corners, no stock photography, no 3D renders.

## Banner set

`Open Stay Pass Banners` carries this brand across: GitHub social preview 1280×640, README hero 1200×300, LinkedIn article header 1200×627, X card 1600×900. 80 px safe margin on social canvases; QR always scannable, resolving to `github.com/FriskyDevelopments/open-stay-pass`.
