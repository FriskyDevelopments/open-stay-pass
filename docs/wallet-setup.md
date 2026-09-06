# Wallet setup

The community QR Studio generates QR codes and PNG previews locally. Its Apple
and Google cards are **preview only**: they neither query a credential server nor
issue Wallet passes. Adding environment variables to the static Netlify site
does not turn those previews into an issuance service.

The root application has server-side Folios issuance in
[`server/wallet/walletIssuer.ts`](../server/wallet/walletIssuer.ts). The standalone
[`open-stay-pass/src/wallet.ts`](../open-stay-pass/src/wallet.ts) is an adapter
contract. Configure the application server that actually runs the issuer.

## Apple Wallet

Supply these variables through the credential server's secret manager:

| Variable | Contents |
| --- | --- |
| `APPLE_PASS_TYPE_ID` | Registered Apple Pass Type ID, matching the signing certificate. |
| `APPLE_TEAM_ID` | Developer Team ID matching the certificate. |
| `APPLE_CERTIFICATE_P12_BASE64` | Base64-encoded P12 containing the Pass Type ID certificate and its private key. |
| `APPLE_CERTIFICATE_PASSWORD` | Password used when exporting that P12. |

Use a Pass Type ID signing certificate, not a Sign in with Apple key. Follow
[Apple's certificate setup](https://developer.apple.com/help/account/capabilities/create-wallet-identifiers-and-certificates)
and [pass signing requirements](https://developer.apple.com/documentation/walletpasses/building-a-pass).
Confirm that the certificate is current and that the packaged server can read
the WWDR certificate and icon used by `createAppleFoliosPass`.

The issuer exposes `/wallet/apple?token=…` for an eligible signed Folios handoff.
Validate the downloaded `.pkpass` on an Apple device before reporting the
integration as live. The local readiness check opens the P12 and finds a key and
certificate; it does not prove device acceptance or check certificate expiry
and identifier matching.

## Google Wallet

Supply these variables through the credential server's secret manager:

| Variable | Contents |
| --- | --- |
| `GOOGLE_WALLET_ISSUER_ID` | Google Wallet issuer ID. |
| `GOOGLE_WALLET_SERVICE_ACCOUNT_JSON` | Complete service-account JSON, including `client_email` and its PEM private key. |

Authorize that service account for the intended Wallet issuer. The current
implementation references the generic class `<issuerId>.folios_cfdi`; provision
that class before testing Save to Google Wallet. The code signs an object with
that class ID but does not create the class. See
[Google's class and object flow](https://developers.google.com/wallet/generic/use-cases/create).

Validate a save using an authorized test account. New issuers begin in demo mode;
public issuance requires
[Google's publishing approval](https://developers.google.com/wallet/generic/test-and-go-live/request-publishing-access).
The local readiness check only proves that the configured key can sign a JWT.
The optional OAuth check proves token acquisition, not access to the issuer,
class availability, publishing approval, or successful saving on a device.

## Verification and scope

Keep all signing material on the server. Never add it to `VITE_*` variables,
community assets, downloadable folders, screenshots, or source control. The
variable names are documented in [`.env.example`](../.env.example); real values
belong in the deployment's secret store.

Check Wallet status from the deployed application. An unavailable status request
cannot establish whether credentials are missing. A `ready` response describes
the local checks above; record a successful pass download or save separately.

The existing Folios routes require an active signed handoff and an issued invoice
with an invoice number. The studio's arbitrary public URL is not eligible input
for those routes. Enabling a community URL pass issuer would be a separate
implementation. Keep the QR link available while Wallet is unconfigured.

The [earlier demo validation note](wallet-demo-validation-status.md) records a
previous local run. Revalidate the current server rather than treating that note
as current deployment status.
