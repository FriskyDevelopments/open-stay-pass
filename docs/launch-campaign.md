# Open Stay Pass Launch Campaign: Scan, Tap, Continue

## Campaign idea

**One credential. Four physical-digital surfaces. Zero enterprise setup required.** The campaign demonstrates a real small-operator sequence: a guest scans a QR code or taps an NDEF tag, arrives in HostCasa, follows a signed link, and sees the same credential survive a Folios handoff or issued fiscal record. Wallet and lock adapters are shown with their true capability state, not as decorative promises.

## Creative system

| Asset | Job | Proof shown | Call to action |
|---|---|---|---|
| 12-second scan/tap clip | Stop attention | QR scan → mobile guide → signed state | Run the demo |
| 30-second operator walkthrough | Explain the wedge | One stay, revocation, NDEF URL, ticket transition | Star or fork the repository |
| Static credential poster | Build visual recall | Pass card, QR grid, Paper/Ink fiscal rail | Open the README |
| Smart-lock boundary diagram | Earn technical trust | Credential URL separate from access provisioning | Review the adapter contract |
| CFDI lifecycle carousel | Show differentiation | Proof → review → issued → cancelled/rejected, same link | Try the public demo |

## Public-message hierarchy

1. **Lead with a concrete operator problem:** “Guests should not need six apps to arrive.”
2. **Show the physical interaction:** QR scan or NFC tap.
3. **Prove the system boundary:** signed URL, revocation, no lock secret in the carrier.
4. **Give the open-source next step:** clone, run, validate, star only if it helped.
5. **Offer paid help only after value is clear:** implementation, managed operations, Wallet certificates, verified connectors, AI continuity.

## Reddit: reviewable drafts only

These are drafts, not instructions to mass-post. Before submission, check each community’s current rules, disclosure expectations, and self-promotion policy. Post once where the contribution is genuinely useful; do not cross-post identical copy or use comments as disguised advertisements.

### Draft A: self-hosted / technical audience

**Title:** I built a QR-first, self-hostable guest credential rail that keeps NFC and Wallet as optional adapters

**Body:** Small hospitality operators often need an arrival link before they need a full PMS migration. I open-sourced a Spanish-first reference MVP where one short-lived, revocable URL can power a QR code, an NDEF NFC tag, a guest guide, and a Folios handoff. Wallet actions only appear when official credentials work; smart-lock provisioning is deliberately external so no door secret lands in QR, NFC, Wallet, or browser state. I’d value feedback on the credential boundary, Docker/self-hosting path, and provider-adapter contract. If you run it and it is useful, a GitHub Star helps other operators find it. [repository URL]

### Draft B: hospitality-operator audience

**Title:** What if guest arrival started with one secure scan—not another mandatory app?

**Body:** I’m testing an open-source, bilingual arrival flow for independent operators: a guest scans a QR or taps an NFC tag, gets a calm property guide, and can continue through a secure handoff when needed. The design goal is simple: no app download, no hidden physical-access key in the QR, and no integration required before the first guest can use it. I’m looking for feedback from hosts on the first five minutes of arrival: Wi-Fi, access instructions, rules, local recommendations, and what still causes support messages. Demo/repository: [repository URL]

### Draft C: contextual comment

> I’m working on a related open-source approach: the QR/NFC carrier contains only a short-lived signed link, while lock access stays with the provider adapter. It keeps the first-run experience useful even when the lock/PMS integration is not ready. If the architecture is useful, I can share the credential and adapter contract rather than drop a generic product link.

## Apify research protocol

The Apify official MCP was enabled for public research. It identified a Reddit research Actor, but no paid scrape has been run. Any future run needs a documented search scope, a result cap, a charge cap, and approval before execution. The research goal is to learn recurring operator questions and community fit, not profile individual users or automate outreach.

## Measurement plan

| Stage | Signal | Decision it informs |
|---|---|---|
| Discovery | README visits, demo opens, video completion | Is the physical-digital story clear? |
| Activation | Demo credential created, QR resolved on a second device | Does the zero-setup wedge work? |
| Trust | Repository stars after a successful run, documentation feedback | Is the code and boundary credible? |
| Intent | Qualified implementation or connector inquiry | Which optional service should be packaged next? |

## Approval gate

No Reddit post, comment, direct message, paid promotion, Actor run that incurs cost, or public claim of adoption may happen until the user reviews the exact destination URL, community, copy, disclosure, and final action list.
