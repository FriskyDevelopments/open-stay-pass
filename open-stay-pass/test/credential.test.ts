import { describe, expect, it } from "vitest";
import { createCredential, ndefPayload } from "../src/credential.js";
import { continuityFor } from "../src/continuity.js";

const secret = "a-test-secret-with-at-least-thirty-two-characters";

describe("continuity rails", () => {
  it("reuses one signed resolver URL for QR and NFC carriers", () => {
    const credential = createCredential({ tenantId: "tenant-1", propertyId: "property-1", stayId: "stay-1", credentialId: "credential-1", product: "folios", expiresAt: Date.now() + 60_000 }, secret, "https://example.com");
    expect(credential.href).toContain("/handoff?token=");
    expect(ndefPayload(credential)).toBe(credential.href);
    expect(continuityFor("folios").purpose).toContain("Proof Handoff");
  });
});
