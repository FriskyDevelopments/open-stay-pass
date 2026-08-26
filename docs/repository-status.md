# Repository Status

## Current state

Open Stay Pass was already initialized as a managed Git repository on the `main` branch. The active managed remote tracks the project checkpoint history; the latest committed checkpoint is the Folios Compliance Brandbook V2 release.

## Tracked-file audit

The audit found no tracked `.env` files, dependency directories, production build output, Apple `.pkpass` files, P12/PFX signing bundles, or likely raw base64 secret blobs. Sensitive Wallet material is only loaded from managed environment variables and is excluded by `.gitignore`.

## Exporting to a user-owned remote

Use the project management interface: **Settings → GitHub**, select the destination owner and repository name, then export. This preserves the current managed repository while creating a user-owned GitHub remote without copying runtime secrets. After export, add CI secrets in the destination repository settings rather than committing them.
