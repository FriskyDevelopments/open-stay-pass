import { describe, expect, it } from "vitest";
import { decryptCredentialToken, encryptCredentialToken, issueCredentialToken } from "./credentialService";
import { resolveConciergeRuntime } from "./conciergeConfig";

describe("credential share recovery and ConciergeAI runtime", () => {
  it("encrypts a share token at rest and recovers it only with the protected server secret", () => {
    const token = issueCredentialToken({ credentialId: "recovery-credential", scope: "arrival", expiresAt: Date.now() + 60_000 });
    const encrypted = encryptCredentialToken(token);
    expect(encrypted.tokenCiphertext).not.toContain(token);
    expect(decryptCredentialToken(encrypted)).toBe(token);
    expect(decryptCredentialToken({ ...encrypted, tokenTag: "tampered" })).toBeNull();
  });

  it("selects the built-in live provider by default and a local grounded fallback when requested", () => {
    expect(resolveConciergeRuntime({ CONCIERGE_LLM_MODEL: "claude-haiku-4-5" })).toEqual({ provider: "built_in", model: "claude-haiku-4-5", usesLiveProvider: true });
    expect(resolveConciergeRuntime({ CONCIERGE_PROVIDER: "local" })).toEqual({ provider: "local", model: undefined, usesLiveProvider: false });
  });
});
