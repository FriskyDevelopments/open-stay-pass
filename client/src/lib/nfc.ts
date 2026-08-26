export function ndefUrlPayload(signedCredentialUrl: string) {
  const url = new URL(signedCredentialUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("An NFC credential must contain an HTTP(S) signed URL.");
  }
  return url.toString();
}
