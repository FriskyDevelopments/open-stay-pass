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
              { name: "Google Calendar", category: "Nango", state: "available", description: "Sincronización opcional." },
              { name: "Cerraduras inteligentes", category: "Custom", state: "design_required", description: "Diseño por proveedor." },
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
    expect(screen.getByText("Núcleo independiente")).toBeTruthy();
    expect(screen.getByText("Resolver firmado")).toBeTruthy();
    expect(screen.getByText("NDEF URL")).toBeTruthy();
    expect(screen.getByText("Conecta contexto, no credenciales.")).toBeTruthy();
  });

  it("reports Apple availability and Google gating honestly", () => {
    render(React.createElement(Integrations));
    expect(screen.getByText("Pase firmado · disponible")).toBeTruthy();
    expect(screen.getByText("Requiere configuración")).toBeTruthy();
    expect(screen.getByText(/cuenta de servicio pueda firmar/i)).toBeTruthy();
  });

  it("makes NFC and smart-lock authority limits inspectable", () => {
    render(React.createElement(Integrations));
    expect(screen.getByText(/Nunca un PIN, llave BLE ni autorización permanente/i)).toBeTruthy();
    expect(screen.getByText("Límite de cerradura")).toBeTruthy();
    expect(screen.getByText(/Acceso físico pertenece al proveedor/i)).toBeTruthy();
  });
});
