import type { ProductRail } from "./types.js";

export const continuityRails: Array<{ product: ProductRail; purpose: string; carrier: string }> = [
  { product: "hostcasa", purpose: "Guest Continuity Rail: arrival guide and grounded assistance.", carrier: "QR / NDEF URL / Wallet reference" },
  { product: "folios", purpose: "Proof Handoff Rail: evidence, decision, and next action.", carrier: "QR / NDEF URL / Wallet reference" },
];

export function continuityFor(product: ProductRail) {
  return continuityRails.find((rail) => rail.product === product)!;
}
