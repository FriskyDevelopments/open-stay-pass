import { signCredential } from "./token.js";
import type { CredentialEnvelope, CredentialPayload } from "./types.js";

export function createCredential(payload: CredentialPayload, secret: string, resolverBaseUrl: string): CredentialEnvelope {
  const token = signCredential(payload, secret);
  const route = payload.product === "hostcasa" ? "/arrival" : "/handoff";
  return {
    href: `${resolverBaseUrl.replace(/\/$/, "")}${route}?token=${encodeURIComponent(token)}`,
    token,
    state: "active",
    product: payload.product,
  };
}

export function ndefPayload(credential: CredentialEnvelope): string {
  return credential.href;
}
