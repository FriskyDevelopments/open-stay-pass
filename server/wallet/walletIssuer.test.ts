import { describe, expect, it } from "vitest";
import { walletReadiness } from "./walletIssuer";

describe("Folios Wallet issuer readiness", () => {
  it("requires the complete server-side configuration before reporting Apple Wallet ready", () => {
    const original = {
      passType: process.env.APPLE_PASS_TYPE_ID,
      team: process.env.APPLE_TEAM_ID,
      certificate: process.env.APPLE_CERTIFICATE_P12_BASE64,
    };
    delete process.env.APPLE_PASS_TYPE_ID;
    delete process.env.APPLE_TEAM_ID;
    delete process.env.APPLE_CERTIFICATE_P12_BASE64;
    expect(walletReadiness("apple")).toBe(false);
    process.env.APPLE_PASS_TYPE_ID = original.passType;
    process.env.APPLE_TEAM_ID = original.team;
    process.env.APPLE_CERTIFICATE_P12_BASE64 = original.certificate;
  });

  it("requires an issuer ID and parseable service account before reporting Google Wallet ready", () => {
    const original = {
      issuer: process.env.GOOGLE_WALLET_ISSUER_ID,
      account: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON,
    };
    delete process.env.GOOGLE_WALLET_ISSUER_ID;
    delete process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON;
    expect(walletReadiness("google")).toBe(false);
    process.env.GOOGLE_WALLET_ISSUER_ID = original.issuer;
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON = original.account;
  });
});
