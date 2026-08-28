import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

const probePayload = "open-stay-pass:credential-readiness";

function credentialSecret(): string {
  const secret = process.env.CREDENTIAL_HMAC_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("CREDENTIAL_HMAC_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

function credentialEncryptionKey() {
  return createHash("sha256").update(credentialSecret()).digest();
}

export function signCredentialPayload(payload: string): string {
  return createHmac("sha256", credentialSecret()).update(payload).digest("base64url");
}

export function verifyCredentialPayload(payload: string, signature: string): boolean {
  const expected = Buffer.from(signCredentialPayload(payload));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function credentialSigningReadiness() {
  const signature = signCredentialPayload(probePayload);
  return {
    configured: true,
    verified: verifyCredentialPayload(probePayload, signature),
    algorithm: "HMAC-SHA-256" as const,
  };
}

export type SignedTokenPayload = {
  credentialId: string;
  scope: "arrival" | "handoff";
  expiresAt: number;
  nonce: string;
};

export function issueCredentialToken(input: Omit<SignedTokenPayload, "nonce">): string {
  const payload: SignedTokenPayload = { ...input, nonce: randomUUID() };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signCredentialPayload(encoded)}`;
}

export function hashCredentialToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function encryptCredentialToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", credentialEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return {
    tokenCiphertext: ciphertext.toString("base64url"),
    tokenIv: iv.toString("base64url"),
    tokenTag: cipher.getAuthTag().toString("base64url"),
  };
}

export function decryptCredentialToken(input: { tokenCiphertext?: string | null; tokenIv?: string | null; tokenTag?: string | null }) {
  return decryptSecret({ ciphertext: input.tokenCiphertext, iv: input.tokenIv, tag: input.tokenTag });
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", credentialEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64url"),
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
  };
}

export function decryptSecret(input: { ciphertext?: string | null; iv?: string | null; tag?: string | null }) {
  if (!input.ciphertext || !input.iv || !input.tag) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", credentialEncryptionKey(), Buffer.from(input.iv, "base64url"));
    decipher.setAuthTag(Buffer.from(input.tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(input.ciphertext, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export function verifyCredentialToken(token: string): SignedTokenPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !verifyCredentialPayload(encoded, signature)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SignedTokenPayload;
    if (!payload.credentialId || !payload.scope || !payload.expiresAt || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function credentialAccessState(input: {
  token: string;
  expectedScope: "arrival" | "handoff";
  storedTokenHash: string;
  status: "active" | "revoked" | "expired";
  expiresAt: Date;
}) {
  const payload = verifyCredentialToken(input.token);
  if (!payload || payload.scope !== input.expectedScope || input.storedTokenHash !== hashCredentialToken(input.token)) return "invalid" as const;
  if (input.status === "revoked") return "revoked" as const;
  if (input.status === "expired" || input.expiresAt.getTime() < Date.now()) return "expired" as const;
  return "active" as const;
}
