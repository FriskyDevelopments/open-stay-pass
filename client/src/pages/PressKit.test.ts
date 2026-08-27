// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PressKit from "./PressKit";

vi.stubGlobal("React", React);

describe("PressKit public campaign surface", () => {
  afterEach(() => cleanup());

  it("defaults to the three English-dubbed promotional videos without subtitle tracks", () => {
    const { container } = render(React.createElement(PressKit));
    expect(container.querySelectorAll("video")).toHaveLength(3);
    expect(container.querySelectorAll("track")).toHaveLength(0);
    expect(screen.getByText("The proof carries arrival.")).toBeTruthy();
    expect(screen.getByText("Provider boundary")).toBeTruthy();
    expect(container.querySelector('source[src*="hero-en-dub"]')).toBeTruthy();
  });

  it("retains the original Spanish edition as a subtitle-free language option", () => {
    const { container } = render(React.createElement(PressKit));
    fireEvent.click(screen.getByRole("button", { name: "ESPAÑOL" }));
    expect(screen.getByText("El comprobante lleva la llegada.")).toBeTruthy();
    expect(screen.getByText("Límite del proveedor")).toBeTruthy();
    expect(container.querySelector('source[src*="hero-en-dub"]')).toBeFalsy();
    expect(container.querySelectorAll("track")).toHaveLength(0);
  });

  it("links to the verified public repository and states the smart-lock boundary", () => {
    render(React.createElement(PressKit));
    const repositoryLink = screen.getByRole("link", { name: /star on github/i });
    expect(repositoryLink.getAttribute("href")).toBe("https://github.com/FriskyDevelopments/open-stay-pass");
    expect(screen.getByText(/Physical access belongs to the provider/i)).toBeTruthy();
  });

  it("makes Wallet and physical-access capability states inspectable before promotion", () => {
    render(React.createElement(PressKit));
    expect(screen.getByText("Apple-ready")).toBeTruthy();
    expect(screen.getByText("Configuration required")).toBeTruthy();
    expect(screen.getByText("Provider-owned")).toBeTruthy();
    expect(screen.getByText(/not a door key/i)).toBeTruthy();
  });
});
