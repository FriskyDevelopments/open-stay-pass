import { describe, expect, it } from "vitest";
import { signCredential, verifyCredential } from "../src/token.js";

const secret = "a-test-secret-with-at-least-thirty-two-characters";
const payload = { tenantId: "tenant-1", propertyId: "property-1", stayId: "stay-1", credentialId: "credential-1", product: "hostcasa" as const, expiresAt: Date.now() + 60_000 };

describe("signed credential", () => {
  it("verifies an active tenant-scoped credential", () => {
    expect(verifyCredential(signCredential(payload, secret), secret)).toMatchObject({ tenantId: "tenant-1", product: "hostcasa" });
  });
  it("rejects a tampered or expired credential", () => {
    expect(verifyCredential(`${signCredential(payload, secret)}x`, secret)).toBeNull();
    expect(verifyCredential(signCredential({ ...payload, expiresAt: 1 }, secret), secret)).toBeNull();
  });
});
