import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("credential.signingReady", () => {
  it("uses the configured HMAC secret to sign and verify a readiness probe", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(caller.credential.signingReady()).resolves.toEqual({
      configured: true,
      verified: true,
      algorithm: "HMAC-SHA-256",
    });
  });
});
