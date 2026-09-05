# Repository Status

## Repository baseline — 2026-09-05

The public repository is [FriskyDevelopments/open-stay-pass](https://github.com/FriskyDevelopments/open-stay-pass), with `main` as its default branch. This update starts from `827835c`, the merge of the mysql2 3.23.1 dependency update. GitHub Actions already runs commit-message validation and the product test/type/build checks.

## Brand and community update

- Preserved all 54 files from the Claude Design export; [provenance and scope](brand/README.md).
- Applied the Sky palette and original Signed Stroke mark to the standalone community/docs and QR Studio surface.
- Added a browser-only URL-to-QR flow with SVG/PNG downloads and English/Spanish controls.
- Added MIT and Code of Conduct pages, Netlify attribution, and a separate `dist/oss-review` build.
- Added community test/type/build checks to CI and a [Netlify review-site runbook](netlify-community-review.md).

The existing HostCasa/Folios product UI and APIs are separate from this community build. The preserved export names additional design pages that were absent from the downloaded archive; they have not been invented or represented as imported.

## Local validation

The product suite passed 51 tests; three provider-dependent tests remained skipped. Product type-check and production build passed. The community QR suite passed nine tests. Browser checks decoded the actual canvas, downloaded SVG and PNG, verified English/Spanish switching, rejected invalid input without leaving an old download active, and checked 1440px desktop plus 390px/320px mobile layouts without horizontal overflow. All local HTML link targets in the 19-page community/design-system build resolved.

This is local implementation evidence. No Netlify publication, support reply, domain attachment, DNS cutover, physical-phone scan, or provider-backed Wallet/credential test was performed as part of this repository update. Existing product builds still warn about optional, unset analytics variables.
