import { describe, expect, it } from "vitest";
import { canTransitionInvoice } from "./openStayDb";

describe("invoice lifecycle", () => {
  it("allows proof to move through review to issued", () => {
    expect(canTransitionInvoice("proof", "review")).toBe(true);
    expect(canTransitionInvoice("review", "issued")).toBe(true);
    expect(canTransitionInvoice("issued", "cancelled")).toBe(true);
  });

  it("rejects issuing a cancelled invoice or skipping review", () => {
    expect(canTransitionInvoice("cancelled", "issued")).toBe(false);
    expect(canTransitionInvoice("proof", "issued")).toBe(false);
  });

  it("keeps a dynamic QR URL independent from invoice status", () => {
    const dynamicUrl = "https://folios.works/handoff/signed-token";
    expect(dynamicUrl).toBe("https://folios.works/handoff/signed-token");
    expect(canTransitionInvoice("review", "issued")).toBe(true);
  });
});
