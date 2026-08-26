import { describe, expect, it } from "vitest";
import { createAppleFoliosPass, verifyGoogleWalletCredentials, walletReadiness } from "./walletIssuer";

const issuedPass = {
  title: "Folios live credential validation",
  invoiceNumber: "TEST-CFDI-001",
  invoiceStatus: "issued" as const,
  ownerName: "Folios operator",
  handoffUrl: "https://staypass-pmz7aqns.manus.space/handoff/test-token",
  serial: "folios-live-credential-validation",
  updatedAt: new Date(),
};

const describeLiveCredentials = process.env.RUN_WALLET_LIVE_CREDENTIAL_TESTS === "true" ? describe : describe.skip;

describeLiveCredentials("Folios live Wallet credentials", () => {
  it("signs a real Apple Wallet pass using the configured certificate bundle", async () => {
    expect(walletReadiness("apple")).toBe(true);
    const pass = await createAppleFoliosPass(issuedPass, "en");
    expect(pass.subarray(0, 2).toString("hex")).toBe("504b");
  }, 30_000);

  it("obtains a Google service-account access token for Wallet issuance", async () => {
    expect(walletReadiness("google")).toBe(true);
    await expect(verifyGoogleWalletCredentials()).resolves.toBe(true);
  }, 30_000);
});
