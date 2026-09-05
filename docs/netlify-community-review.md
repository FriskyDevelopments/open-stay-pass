# Netlify community review site

## Scope

`stay-pass-qr-studio` is the intended **community documentation and QR Studio** review site. Its build includes the MIT license, Code of Conduct, a link reading **This site is powered by Netlify**, and the original Claude Design system. QR generation runs locally in the browser and accepts HTTP(S) URLs. It is a URL encoder, not a credential issuer.

The output contains no operator login, commercial checkout, support/hosting offer, product API proxy, signing secret, guest records, or analytics. The upstream repository also contains product integration code and optional support links; review-site isolation does not itself establish Netlify OSS eligibility. Netlify must decide eligibility with that context disclosed.

## Build and inspect

From the repository root, with Node 22 and the pinned pnpm version:

```bash
pnpm install --frozen-lockfile
pnpm test:community
pnpm build:community
python3 -m http.server 4178 --directory dist/oss-review
```

Open `http://localhost:4178`. Check EN/ES switching, both QR download formats, the decoded destination, mobile layout, the brand manual, license, and Code of Conduct. No provider credentials are needed. The generated directory is separate from the product build at `dist/public`.

## Review-site configuration

Verify the existing **stay-pass-qr-studio** site and its team before changing deployment settings. For a Git-connected build, set its package directory to `community`, keep its base directory at the repository root, and use `community/netlify.toml`. Build command: `pnpm build:community`. Publish directory: `dist/oss-review`. No product environment variables are needed. Netlify documents [package-directory configuration](https://docs.netlify.com/build/configure-builds/monorepos/) and [file-based build configuration](https://docs.netlify.com/build/configure-builds/file-based-configuration/).

The config is deliberately scoped to `community/`, rather than a root `netlify.toml` that could override other Netlify projects already connected to this repository. Do not publish the repository root or the commercial product bundle as the OSS review site.

## Maintainer's requested sequence — 2026-09-05

1. Publish only the community/docs and QR Studio build to the verified `stay-pass-qr-studio` Netlify project, after deployment authorization. Confirm its `*.netlify.app` URL and all review links.
2. Reply to the existing Netlify support case with that verified URL, after authorization to send. This repository update does not send a support message.
3. Wait for the OSS-plan decision. Attach `staypass.dev` only after separate approval and an eligibility check for the exact content that domain will serve. If it serves the commercial HostCasa/Folios product, use an appropriate separate project or plan unless Netlify explicitly permits it.
4. Keep Cloudflare Pages as the fallback through the later cutover. Product APIs remain on their existing Manus and Folios Worker paths.

The maintainer reported the review site as unpublished and the domain returning 404 when providing this sequence. Those are supplied operational notes, not a live deployment verification. This change supplies the reviewable build and documentation; it does not change DNS, attach a hostname, grant an OSS plan, or verify provider-backed credential issuance.
