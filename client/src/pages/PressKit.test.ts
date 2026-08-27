// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PressKit from "./PressKit";

vi.stubGlobal("React", React);

describe("PressKit public campaign surface", () => {
  afterEach(() => cleanup());

  it("renders the three Spanish-first promotional videos with controlled English subtitles", () => {
    const { container } = render(React.createElement(PressKit));
    expect(container.querySelectorAll("video")).toHaveLength(3);
    expect(container.querySelectorAll('track[kind="subtitles"][srclang="en"]')).toHaveLength(3);
    expect(screen.getByText("El comprobante lleva la llegada.")).toBeTruthy();
    expect(screen.getByText("Límite del proveedor")).toBeTruthy();
  });

  it("links to the verified public repository and states the smart-lock boundary", () => {
    render(React.createElement(PressKit));
    const repositoryLink = screen.getByRole("link", { name: /dale star en github/i });
    expect(repositoryLink.getAttribute("href")).toBe("https://github.com/FriskyDevelopments/open-stay-pass");
    expect(screen.getByText(/El acceso físico pertenece al proveedor/i)).toBeTruthy();
  });

  it("makes Wallet and physical-access capability states inspectable before promotion", () => {
    render(React.createElement(PressKit));
    expect(screen.getByText("Listo para Apple")).toBeTruthy();
    expect(screen.getByText("Requiere configuración")).toBeTruthy();
    expect(screen.getByText("Propiedad del proveedor")).toBeTruthy();
    expect(screen.getByText(/no es una llave de puerta/i)).toBeTruthy();
  });
});
