// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";

vi.stubGlobal("React", React);

describe("Home language default", () => {
  afterEach(() => cleanup());

  it("opens in English and switches to the retained Spanish landing copy", () => {
    render(React.createElement(Home));
    expect(screen.getByRole("heading", { name: /one credential\. one continuous record/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /view integrations/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "ES" }));
    expect(screen.getByRole("heading", { name: /una credencial\. un registro continuo/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /ver integraciones/i })).toBeTruthy();
  });
});
