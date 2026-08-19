import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { hashCredentialToken, issueCredentialToken } from "./credentialService";

const mocks = vi.hoisted(() => ({
  completeHandoff: vi.fn(),
  createOperatorNotification: vi.fn(),
  getCredentialById: vi.fn(),
  getHandoffById: vi.fn(),
  getOperatorNotificationSettings: vi.fn(),
}));

vi.mock("./openStayDb", () => ({
  completeHandoff: mocks.completeHandoff,
  createHandoffWithCredential: vi.fn(),
  createOperatorNotification: mocks.createOperatorNotification,
  createStayWithCredential: vi.fn(),
  getCredentialById: mocks.getCredentialById,
  getHandoffById: mocks.getHandoffById,
  getOperatorNotificationSettings: mocks.getOperatorNotificationSettings,
  getStayById: vi.fn(),
  listOperatorRecords: vi.fn(),
  recordCredentialActivity: vi.fn(),
  revokeCredentialForOperator: vi.fn(),
  updateOperatorNotificationSettings: vi.fn(),
}));

vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn() }));

import { openStayRouter } from "./openStayRouter";

describe("Folios signed handoff completion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("completes the handoff and records an in-app operator notification", async () => {
    const token = issueCredentialToken({ credentialId: "11111111-1111-4111-8111-111111111111", scope: "handoff", expiresAt: Date.now() + 60_000 });
    mocks.getCredentialById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      operatorId: 7,
      handoffId: "22222222-2222-4222-8222-222222222222",
      tokenHash: hashCredentialToken(token),
      status: "active",
      expiresAt: new Date(Date.now() + 60_000),
    });
    mocks.getHandoffById.mockResolvedValue({ title: "Close the guest arrival proof" });
    mocks.completeHandoff.mockResolvedValue({ shouldNotify: true });
    mocks.getOperatorNotificationSettings.mockResolvedValue({ operatorId: 7, channel: "in_app_only", enabled: true });
    mocks.createOperatorNotification.mockResolvedValue({});

    const caller = openStayRouter.createCaller({ user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] });
    await expect(caller.public.completeHandoff({ token, locale: "en" })).resolves.toEqual({ completed: true });
    expect(mocks.completeHandoff).toHaveBeenCalledWith(expect.objectContaining({ operatorId: 7, locale: "en" }));
    expect(mocks.createOperatorNotification).toHaveBeenCalledWith(expect.objectContaining({
      type: "handoff_completed",
      deliveryStatus: "queued",
      titleEn: "Folios: handoff completed",
    }));
  });
});
