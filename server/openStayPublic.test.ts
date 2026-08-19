import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const caller = appRouter.createCaller({
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("Open Stay Pass public adapters", () => {
  it("returns explicit Apple Wallet configuration-required messaging in Spanish and English", async () => {
    const spanish = await caller.openStay.public.walletStatus({ platform: "apple", locale: "es" });
    const english = await caller.openStay.public.walletStatus({ platform: "apple", locale: "en" });
    expect(spanish.state).toBe("configuration_required");
    expect(spanish.message).toContain("requiere");
    expect(english.message).toContain("requires");
  });

  it("returns a bilingual progressive integration plan", async () => {
    const spanish = await caller.openStay.public.integrations({ locale: "es" });
    const english = await caller.openStay.public.integrations({ locale: "en" });
    expect(spanish).toHaveLength(5);
    expect(spanish[0]?.description).toContain("Sincronización");
    expect(english[0]?.description).toContain("synchronization");
  });
});
