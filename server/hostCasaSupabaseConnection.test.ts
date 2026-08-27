import { describe, expect, it } from "vitest";
import { resolveHostCasaSsoStatus } from "./hostCasaSsoConfig";

describe("HostCasa Supabase connection", () => {
  const canProbeProvider = process.env.RUN_HOSTCASA_SUPABASE_CONNECTION_TESTS === "true"
    && Boolean(process.env.VITE_HOSTCASA_SUPABASE_URL?.trim())
    && Boolean(process.env.VITE_HOSTCASA_SUPABASE_ANON_KEY?.trim());

  it.runIf(canProbeProvider)("accepts the configured public key at the provider settings endpoint", async () => {
    const status = resolveHostCasaSsoStatus();
    const publicKey = process.env.VITE_HOSTCASA_SUPABASE_ANON_KEY?.trim();

    expect(status.configured).toBe(true);
    expect(status.supabaseUrl).toBeTruthy();
    expect(publicKey).toBeTruthy();

    const response = await fetch(`${status.supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: publicKey! },
    });

    expect(response.ok).toBe(true);
  });
});
