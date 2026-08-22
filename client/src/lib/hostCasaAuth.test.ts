import { describe, expect, it, vi } from "vitest";
import { signOutHostCasaSession } from "./hostCasaAuth";

describe("HostCasa shared auth logout", () => {
  it("clears the persisted Supabase session", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });
    await signOutHostCasaSession({ auth: { signOut } } as never);
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("does nothing when shared auth is not configured", async () => {
    await expect(signOutHostCasaSession(null)).resolves.toBeUndefined();
  });
});
