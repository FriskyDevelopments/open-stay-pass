// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Integrations from "./Integrations";

vi.stubGlobal("React", React);

vi.mock("@/lib/trpc", () => ({
  trpc: {
    openStay: {
      public: {
        integrations: {
          useQuery: () => ({
            isLoading: false,
            data: [
              { name: "Google Calendar", category: "Nango", state: "available", description: "Optional sync." },
              { name: "Smart locks", category: "Custom", state: "design_required", description: "Provider-specific design." },
            ],
          }),
        },
        walletStatus: {
          useQuery: ({ platform }: { platform: "apple" | "google" }) => ({
            data: platform === "apple" ? { state: "ready" } : { state: "configuration_required" },
          }),
        },
      },
    },
  },
}));

describe("Integrations capability map", () => {
  afterEach(() => cleanup());

  it("keeps the independent signed-credential core visible before optional connectors", () => {
    render(React.createElement(Integrations));
    expect(screen.getByText("Independent core")).toBeTruthy();
    expect(screen.getByText("Signed resolver")).toBeTruthy();
    expect(screen.getByText("NDEF URL")).toBeTruthy();
    expect(screen.getByText("Connect context, not credentials.")).toBeTruthy();
  });

  it("reports Apple availability and Google gating honestly", () => {
    render(React.createElement(Integrations));
    expect(screen.getByText("Signed pass · available")).toBeTruthy();
    expect(screen.getByText("Configuration required")).toBeTruthy();
    expect(screen.getByText(/service account can sign/i)).toBeTruthy();
  });

  it("makes NFC and smart-lock authority limits inspectable", () => {
    render(React.createElement(Integrations));
    expect(screen.getByText(/Never a PIN, BLE key, or permanent authorization/i)).toBeTruthy();
    expect(screen.getByText("Lock boundary")).toBeTruthy();
    expect(screen.getByText(/Physical access belongs to the provider/i)).toBeTruthy();
  });
});
