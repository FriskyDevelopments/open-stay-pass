import { describe, expect, it } from "vitest";
import { credentialAccessState, hashCredentialToken, issueCredentialToken, verifyCredentialToken } from "./credentialService";
import { shouldNotifyArrival } from "./openStayDb";

describe("Open Stay Pass credential security", () => {
  it("accepts a signed arrival token and rejects a tampered token", () => {
    const token = issueCredentialToken({ credentialId: "credential-demo", scope: "arrival", expiresAt: Date.now() + 60_000 });
    expect(verifyCredentialToken(token)).toMatchObject({ credentialId: "credential-demo", scope: "arrival" });
    expect(verifyCredentialToken(`${token}tampered`)).toBeNull();
  });

  it("enforces scope, expiry, and revocation before a credential can be used", () => {
    const token = issueCredentialToken({ credentialId: "credential-demo", scope: "handoff", expiresAt: Date.now() + 60_000 });
    const input = { token, storedTokenHash: hashCredentialToken(token), status: "active" as const, expiresAt: new Date(Date.now() + 60_000) };
    expect(credentialAccessState({ ...input, expectedScope: "handoff" })).toBe("active");
    expect(credentialAccessState({ ...input, expectedScope: "arrival" })).toBe("invalid");
    expect(credentialAccessState({ ...input, expectedScope: "handoff", status: "revoked" })).toBe("revoked");
    expect(credentialAccessState({ ...input, expectedScope: "handoff", expiresAt: new Date(Date.now() - 1) })).toBe("expired");
  });

  it("notifies an operator for the first scan and throttles repeated scans within one hour", () => {
    const now = Date.now();
    expect(shouldNotifyArrival(null, now)).toBe(true);
    expect(shouldNotifyArrival(new Date(now - 59 * 60 * 1000), now)).toBe(false);
    expect(shouldNotifyArrival(new Date(now - 61 * 60 * 1000), now)).toBe(true);
  });
});
