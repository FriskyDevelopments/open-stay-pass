import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const caller = appRouter.createCaller({
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("Open Stay Pass public adapters", () => {
  it("returns truthful bilingual Apple Wallet readiness messaging", async () => {
    const spanish = await caller.openStay.public.walletStatus({ platform: "apple", locale: "es" });
    const english = await caller.openStay.public.walletStatus({ platform: "apple", locale: "en" });
    if (spanish.state === "ready") {
      expect(spanish.message).toContain("configurada");
      expect(english.state).toBe("ready");
      expect(english.message).toContain("configured");
    } else {
      expect(spanish.message).toContain("requiere");
      expect(english.state).toBe("configuration_required");
      expect(english.message).toContain("requires");
    }
  });

  it("returns a bilingual progressive integration plan", async () => {
    const spanish = await caller.openStay.public.integrations({ locale: "es" });
    const english = await caller.openStay.public.integrations({ locale: "en" });
    expect(spanish).toHaveLength(5);
    expect(spanish[0]?.description).toContain("Sincronización");
    expect(english[0]?.description).toContain("synchronization");
  });

  it("keeps smart locks as an explicit custom adapter rather than a credential payload", async () => {
    const spanish = await caller.openStay.public.integrations({ locale: "es" });
    const lock = spanish.find(item => item.name === "Cerraduras inteligentes");
    expect(lock).toMatchObject({ category: "Custom", state: "design_required" });
    expect(lock?.description).toContain("separada de los payloads de QR y Wallet");
  });
});
