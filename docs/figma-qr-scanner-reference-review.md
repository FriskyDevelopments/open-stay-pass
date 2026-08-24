# Figma QR Scanner Reference Review

## Review status

The provided Figma URL was opened in the connected browser on August 24, 2026. The file title was accessible as **“Bravo sample: QR Code Scanner (Community)”**, but the browser could not expose the Figma canvas or upload a screenshot because the page is isolated behind a browser-extension URL boundary. No visual detail has been inferred from the inaccessible canvas.

## Product decision

Open Stay Pass therefore does not claim to reproduce any unverified Figma-specific layout. The current reader keeps the interaction patterns that are independently appropriate to the product contract: a clear image-selection affordance, explicit Spanish-first/English-controlled labels, an unreadable-image error, a decoded-link preview, and a deliberate **Open and validate link** action. The action passes the decoded URL back to the existing signed arrival or Folios handoff resolver; it does not trust the QR payload as identity data.

## Adoption boundary

A future visual pass can compare the actual Figma frame once an image export or accessible screenshot is supplied. Until then, the reference is treated as inspiration only, and the implementation prioritizes signed-link safety, mobile usability, keyboard access, and bilingual clarity over speculative pixel matching.
