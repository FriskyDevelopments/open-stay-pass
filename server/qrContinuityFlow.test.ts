import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { hashCredentialToken, issueCredentialToken } from "./credentialService";

const mocks = vi.hoisted(() => ({
  getCredentialById: vi.fn(),
  getHandoffById: vi.fn(),
  updateInvoiceStatus: vi.fn(),
  getHandoffInvoiceHistory: vi.fn(),
}));

vi.mock("./openStayDb", () => ({
  getCredentialById: mocks.getCredentialById,
  getHandoffById: mocks.getHandoffById,
  updateInvoiceStatus: mocks.updateInvoiceStatus,
  getHandoffInvoiceHistory: mocks.getHandoffInvoiceHistory,
  canTransitionInvoice: (from: string, to: string) => {
    const valid: Record<string, string[]> = {
      proof: ["review"],
      review: ["issued"],
      issued: ["cancelled"],
    };
    return valid[from]?.includes(to) ?? false;
  },
}));

import { openStayRouter } from "./openStayRouter";

describe("Folios dynamic QR continuity flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves the exact same signed token before and after fiscal transitions", async () => {
    const token = issueCredentialToken({ credentialId: "c1", scope: "handoff", expiresAt: Date.now() + 60_000 });
    const handoffId = "h1";
    
    // Initial state: proof
    const mockCredential = {
      id: "c1",
      operatorId: 7,
      handoffId,
      tokenHash: hashCredentialToken(token),
      status: "active",
      expiresAt: new Date(Date.now() + 60_000),
    };
    
    const mockHandoff = {
      id: handoffId,
      invoiceStatus: "proof",
      invoiceNumber: null,
    };

    mocks.getCredentialById.mockResolvedValue(mockCredential);
    mocks.getHandoffById.mockResolvedValue(mockHandoff);
    mocks.getHandoffInvoiceHistory.mockResolvedValue([]);

    const caller = openStayRouter.createCaller({ user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });
    
    // 1. Resolve as proof
    const res1 = await caller.public.handoff({ token, locale: "es" });
    expect(res1.handoff.invoiceStatus).toBe("proof");
    expect(res1.handoff.invoiceNumber).toBeNull();

    // 2. Transition to review (simulated operator action)
    mockHandoff.invoiceStatus = "review";
    
    // 3. Re-resolve the SAME token
    const res2 = await caller.public.handoff({ token, locale: "es" });
    expect(res2.handoff.invoiceStatus).toBe("review");

    // 4. Transition to issued
    mockHandoff.invoiceStatus = "issued";
    mockHandoff.invoiceNumber = "INV-001";

    // 5. Re-resolve the SAME token again
    const res3 = await caller.public.handoff({ token, locale: "es" });
    expect(res3.handoff.invoiceStatus).toBe("issued");
    expect(res3.handoff.invoiceNumber).toBe("INV-001");
    
    // The signed link remains identical; the underlying fiscal state updates.
    expect(mocks.getCredentialById).toHaveBeenCalledTimes(3);
    expect(mocks.getHandoffById).toHaveBeenCalledTimes(3);
  });
});
