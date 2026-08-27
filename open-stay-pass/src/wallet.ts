import type { AdapterCapability } from "./types.js";

export const walletCapabilities: Record<"apple" | "google" | "nfc" | "smartLock", AdapterCapability> = {
  apple: "configuration_required",
  google: "configuration_required",
  nfc: "ready",
  smartLock: "provider_owned",
};

export const adapterBoundary = "QR, NFC, and Wallet carry a signed resolver only. Smart-lock provisioning, revoke, and audit remain provider-owned server operations.";
