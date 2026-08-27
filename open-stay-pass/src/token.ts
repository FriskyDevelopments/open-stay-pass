import { createHmac, timingSafeEqual } from "node:crypto";
import type { CredentialPayload } from "./types.js";

const encode = (value: string) => Buffer.from(value).toString("base64url");
const decode = (value: string) => Buffer.from(value, "base64url").toString("utf8");

export function signCredential(payload: CredentialPayload, secret: string): string {
  if (secret.length < 32) throw new Error("CREDENTIAL_HMAC_SECRET must be at least 32 characters");
  const body = encode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyCredential(token: string, secret: string, now = Date.now()): CredentialPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  try {
    const payload = JSON.parse(decode(body)) as CredentialPayload;
    return payload.expiresAt > now ? payload : null;
  } catch {
    return null;
  }
}
