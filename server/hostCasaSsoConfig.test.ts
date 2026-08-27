import { describe, expect, it } from "vitest";
import { resolveHostCasaSsoStatus } from "./hostCasaSsoConfig";

describe("HostCasa SSO configuration", () => {
  it("accepts a complete HTTPS Supabase public configuration without returning the anon key", () => {
    const status = resolveHostCasaSsoStatus({
      VITE_HOSTCASA_SUPABASE_URL: "https://example-project-ref.supabase.co",
      VITE_HOSTCASA_SUPABASE_ANON_KEY: "public-anon-key",
    });

    expect(status).toEqual({
      configured: true,
      supabaseUrl: "https://example-project-ref.supabase.co",
      missing: [],
    });
    expect(JSON.stringify(status)).not.toContain("public-anon-key");
  });

  it("fails closed when the shared-login URL or public key is absent or unsafe", () => {
    expect(resolveHostCasaSsoStatus({
      VITE_HOSTCASA_SUPABASE_URL: "http://example.test",
    })).toEqual({
      configured: false,
      missing: ["VITE_HOSTCASA_SUPABASE_URL", "VITE_HOSTCASA_SUPABASE_ANON_KEY"],
    });
  });
});
