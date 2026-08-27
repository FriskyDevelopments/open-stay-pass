// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageToggle } from "./LanguageToggle";

vi.stubGlobal("React", React);

describe("LanguageToggle", () => {
  afterEach(() => cleanup());

  it("presents English first and preserves Spanish as an explicit alternative", () => {
    const onChange = vi.fn();
    render(React.createElement(LanguageToggle, { locale: "en", onChange }));

    const english = screen.getByRole("button", { name: "EN" });
    const spanish = screen.getByRole("button", { name: "ES" });
    expect(english.className).toContain("active");
    expect(spanish.className).not.toContain("active");

    fireEvent.click(spanish);
    expect(onChange).toHaveBeenCalledWith("es");
  });
});
