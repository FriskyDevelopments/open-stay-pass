// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CFDI_COLORS, CFDI_STATE_META, TicketStatusPreview } from "./TicketStatusPreview";

vi.stubGlobal("React", React);

describe("TicketStatusPreview CFDI design contract", () => {
  afterEach(() => cleanup());
  it("exports the precise fiscal color tokens", () => {
    expect(CFDI_COLORS).toMatchObject({
      ink: "#102526",
      paper: "#F2F0E9",
      system: "#5772C7",
      systemInk: "#4055A8",
      proof: "#37CDE0",
      signal: "#C6F43D",
      deepRed: "#B3524A",
      errorInk: "#963F39",
      line: "#BAC0B7",
    });
  });

  it("keeps rejected stamps out of the Wallet-issued path", () => {
    const rejected = CFDI_STATE_META.find(state => state.id === "rejected");
    expect(rejected).toMatchObject({ fiscal: false, color: "#963F39" });
    expect(rejected?.detail).toContain("no se crea ni se presenta un pase Wallet");
  });

  it("transitions from operational proof to fiscal issued theme", () => {
    render(React.createElement(TicketStatusPreview));
    const preview = document.querySelector(".ticket-preview-paper");
    expect(preview?.getAttribute("data-fiscal-theme")).toBe("false");
    fireEvent.click(screen.getByRole("tab", { name: "Factura emitida · Vigente" }));
    expect(preview?.getAttribute("data-fiscal-theme")).toBe("true");
    expect(preview?.className).toContain("ticket-state-issued");
    expect(screen.getByText("Verificada y vigente; el detalle fiscal y la verificación SAT están disponibles.")).toBeTruthy();
  });

  it("renders cancelled and expired as non-valid fiscal states", () => {
    render(React.createElement(TicketStatusPreview));
    const preview = document.querySelector(".ticket-preview-paper");
    fireEvent.click(screen.getByRole("tab", { name: "Factura cancelada" }));
    expect(preview?.className).toContain("ticket-state-cancelled");
    expect(preview?.getAttribute("data-fiscal-theme")).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Sello expirado" }));
    expect(preview?.className).toContain("ticket-state-expired");
    expect(screen.getByText("El pase se conserva para consulta, pero se muestra como no válido y no como vigente.")).toBeTruthy();
  });
});
