import "dotenv/config";
import { createAppleFoliosPass, createGoogleFoliosSaveUrl, walletReadiness } from "../server/wallet/walletIssuer";

const passData = {
  title: "Folios Wallet verification",
  invoiceNumber: "TEST-CFDI-001",
  invoiceStatus: "issued" as const,
  ownerName: "Folios operator",
  handoffUrl: "https://staypass-pmz7aqns.manus.space/handoff/test-token",
  serial: "folios-wallet-verification",
  updatedAt: new Date(),
};

const result: Record<string, unknown> = {
  appleConfigured: walletReadiness("apple"),
  googleConfigured: walletReadiness("google"),
};

if (walletReadiness("apple")) {
  try {
    const pass = await createAppleFoliosPass(passData, "en");
    result.applePkpassBytes = pass.length;
    result.applePkpassHeader = pass.subarray(0, 2).toString("hex");
  } catch (error) {
    result.appleIssuanceError = error instanceof Error ? error.message : "Unknown Apple Wallet signing error.";
  }
}

if (walletReadiness("google")) {
  try {
    const saveUrl = createGoogleFoliosSaveUrl(passData, "en");
    result.googleSaveUrlHost = new URL(saveUrl).host;
    result.googleSaveUrlPath = new URL(saveUrl).pathname.split("/").slice(0, 4).join("/");
  } catch (error) {
    result.googleIssuanceError = error instanceof Error ? error.message : "Unknown Google Wallet signing error.";
  }
}

console.log(JSON.stringify(result));
