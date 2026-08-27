# Folios Compliance Launch Asset Audit

**Scope.** This audit covers the internal delivery package published at `/press-kit`: one 30-second 16:9 hero film, two 14-second 9:16 vertical cuts, the 4:5 campaign poster, English subtitle tracks, and the public landing sequence. It verifies claims, semantic token intent, technical boundaries, and delivery metadata. It does not assert a frame-by-frame aesthetic judgment of generated video.

| Asset | Delivery check | Claim / boundary check | Folios token and narrative check | Result |
|---|---|---|---|---|
| Hero film | `1280×720`, `00:30`, H.264/AAC, Spanish narration, English SRT | Uses the approved QR/NFC → resolver → HostCasa record → Folios decision storyline; it does not claim Google Wallet issuance or physical unlock | Prompt and composition reserve Proof for carrier, System for process, Paper for record, Signal for issued decision | Ready for review |
| Vertical cut A | `720×1280`, `00:14`, H.264/AAC, Spanish narration, English SRT | Describes one signed link behind scan or tap; no credential secret or access grant is shown | Documentary vertical evidence stack with Proof carrier and System resolver rail | Ready for review |
| Vertical cut B | `720×1280`, `00:14`, H.264/AAC, Spanish narration, English SRT | Keeps physical-access provisioning beyond the provider rail; no lock, PIN, or key is shown | Structure separation rail, Proof carrier, System status, and limited Signal decision | Ready for review |
| Campaign poster | `4:5` PNG displayed in press kit | Contains no operator adoption, customer quote, issuance count, or star-count claim | Paper record, Ink frame, Proof marker, System rail, restrained Signal decision | Visually checked in desktop and mobile press-kit views |
| Landing sequence | Desktop and mobile screenshots captured after token correction | Explains **Proof → Resolver → Record → Decision** and separates carrier from provider-owned access | Signal appears at the credential’s verified decision, not as generic headline or Star CTA emphasis | Accepted for current release |
| Public press kit | `/press-kit` with real downloadable media URLs and English caption tracks | Repeats the physical-access boundary and links only to the real public GitHub repository | Uses Ink/Paper documentary surfaces, System/Proof information hierarchy, and restraint around Signal | Tested and mobile checked |

## Guardrails retained

Apple Wallet is described only as a real signed-pass path where signing material validates. Google Wallet remains configuration-gated until the service-account signing path succeeds. NFC is an NDEF carrier for the signed URL, not a terminal Wallet protocol or access key. Smart-lock provisioning remains a provider-owned adapter. No campaign asset may be posted externally until the maintainer approves its exact copy, destination, disclosure, and any spend.

## Acceptance record

The production build is code-split below the previous 500 KB warning threshold for every bundle: the largest route bundle is the lazy-loaded Operator route at approximately 355 KB; the home entry is approximately 451 KB. The final regression suite passes **18 test files / 39 tests**, with the two live Wallet credential checks intentionally skipped outside their explicit credential-validation mode. The public landing and press kit were captured at desktop and mobile widths after the Folios token correction.
