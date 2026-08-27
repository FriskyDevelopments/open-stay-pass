# GitHub Repository Audit — Open Stay Pass

**Repository:** [`FriskyDevelopments/open-stay-pass`](https://github.com/FriskyDevelopments/open-stay-pass)  
**Audit date:** 2026-08-27  
**Scope:** Read-only public metadata, community profile, security configuration, workflow inventory, tracked-file patterns, and parity with the validated local MVP release.

## Executive assessment

The repository has a sound public open-source foundation: it is public, MIT-licensed, TypeScript-based, forkable, issues-enabled, and scored **100%** by GitHub’s community-profile endpoint. Its description accurately describes the QR-first bilingual credential scope without promising direct lock access or unconditional Wallet issuance. Secret scanning and push protection are enabled.

The principal launch risk is **release parity**, not code quality. The public `main` branch is at commit `19171fcd`, whereas the validated local release is at `e9f87807` with further uncheckpointed audit updates. Consequently, the public repository lacks the latest Spanish-first press-kit refinement, connected-browser verification record, and subsequent release evidence. Before promotion, synchronize the validated release to the public remote, then add automation and repository metadata so a first-time visitor sees a reproducible, active project rather than a static source dump.

| Category | Evidence | Status | Priority |
|---|---|---|---|
| Visibility and license | Public repository; MIT license; forking enabled | Ready | — |
| Scope clarity | Accurate description of signed links, NFC, Wallet adapters, HostCasa continuity, and Folios states | Ready | — |
| Community baseline | GitHub community health `100`; README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, PR template present | Ready | — |
| Secret protection | Secret scanning and push protection enabled | Ready | — |
| Public/local parity | Public `main`: `19171fcd`; validated local release: `e9f87807` plus current audit updates | Gap | P0 |
| Continuous integration | Public workflow inventory: `0` workflows | Gap | P0 |
| Dependency response | Dependabot security updates disabled | Gap | P1 |
| Discovery metadata | No topics, no homepage, no Discussions; 0 stars / forks | Gap | P1 |
| Community profile detail | GitHub reports no recognized issue-template directory; documentation link currently resolves to `tree/master/docs` while default branch is `main` | Gap | P1 |

## Verified strengths

The current public repository has the essential trust documents required for community participation. The local MVP includes security boundaries around short-lived signed credentials, QR/NFC carriers, Wallet capability gating, and provider-owned physical access. It also contains a standalone `open-stay-pass/` reference package, operator and guest flows, component and integration tests, and Brandbook-aligned promotion materials. The public description does not overclaim these capabilities.

## Findings and remediation order

### P0 — Synchronize the validated release and add CI

Push the validated local `main` release to `public/main` after confirming the current working tree. Then add a minimal GitHub Actions workflow that installs with a frozen lockfile and runs `pnpm validate`. This will make the existing test/type/build evidence repeatable for contributors and turn the project’s quality story into a visible repository signal.

### P1 — Configure security and discovery

Enable Dependabot security updates. Add focused public topics such as `hospitality`, `qr-code`, `nfc`, `apple-wallet`, `google-wallet`, `typescript`, `cloudflare-workers`, `open-source`, and `bilingual`. Set the homepage to the stable public MVP URL and enable Discussions only if the maintainer can respond to them. Update or add an issue-template configuration that GitHub’s community profile recognizes, and correct the documentation link from `master` to `main`.

### P2 — Improve first-contributor conversion

Add a small architecture diagram, a 60-second quickstart verification path, a screenshot/GIF fallback for the press kit, a `good first issue` backlog, and a release checklist. Keep the support links optional and outside the credential flow. The current post-success Star invitation is appropriate because it is non-blocking and points to the public repository without fabricating a star count.

## Publication recommendation

The repository is suitable for a **quiet technical preview** now, but it is not yet optimized for a broad promotion push because the public branch does not contain the latest validated release and it has no CI workflow. Address P0 first; then the launch package, Reddit drafts, press kit, and Star CTA will reinforce real product proof rather than compensation for missing repository hygiene.

## Evidence references

| Source | Verified fact |
|---|---|
| Public repository metadata | `main` is the default branch; public; MIT; issues and projects enabled; no topics; no homepage; 0 stars/forks at audit time |
| GitHub community profile | 100% community health; contributor/security files present; no recognized issue template; documentation URL points to `master` |
| GitHub Actions API | 0 configured workflows |
| GitHub security configuration | Secret scanning and push protection enabled; Dependabot security updates disabled |
| Local Git comparison | Local validated checkpoint `e9f87807` differs from public `main` at `19171fcd` |
