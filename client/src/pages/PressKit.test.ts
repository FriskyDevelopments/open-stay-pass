// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PressKit from "./PressKit";

vi.stubGlobal("React", React);

describe("PressKit public campaign surface", () => {
  afterEach(() => cleanup());

  it("renders the three brand-aligned promotional videos with English subtitles", () => {
    const { container } = render(React.createElement(PressKit));
    expect(container.querySelectorAll("video")).toHaveLength(3);
    expect(container.querySelectorAll('track[kind="subtitles"][srclang="en"]')).toHaveLength(3);
    expect(screen.getByText("Proof carries the arrival.")).toBeTruthy();
    expect(screen.getByText("Provider boundary")).toBeTruthy();
  });

  it("links to the verified public repository and states the smart-lock boundary", () => {
    render(React.createElement(PressKit));
    const repositoryLink = screen.getByRole("link", { name: /star on github/i });
    expect(repositoryLink.getAttribute("href")).toBe("https://github.com/FriskyDevelopments/open-stay-pass");
    expect(screen.getByText(/Physical access remains provider-owned/i)).toBeTruthy();
  });
});
