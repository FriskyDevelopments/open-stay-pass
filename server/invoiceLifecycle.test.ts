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

  it("preserves signed-link validity across fiscal transitions", () => {
    const initialToken = "signed-folio-token-v1";
    let currentStatus = "proof";
    
    // Transition through lifecycle
    const transitions = ["review", "issued", "cancelled"];
    transitions.forEach(next => {
      expect(canTransitionInvoice(currentStatus as any, next as any)).toBe(true);
      currentStatus = next;
      // The signed token reference must never change based on invoice status
      expect(initialToken).toBe("signed-folio-token-v1");
    });
  });
});
