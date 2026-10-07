// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import Home from "./Home";

vi.stubGlobal("React", React);

beforeAll(() => {
  // framer-motion viewport feature requires IntersectionObserver as a constructor
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor() {}
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

describe("Home language default", () => {
  afterEach(() => cleanup());

  it("renders in English with buyer-narrative hero", () => {
    render(React.createElement(Home));
    // New hero headline from the GTM buyer narrative
    expect(screen.getByRole("heading", { name: /guests should not need six apps to arrive/i })).toBeTruthy();
    // Demo and start CTAs present (may appear in multiple places like hero + footer)
    expect(screen.getAllByRole("link", { name: /try the demo/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /get started/i }).length).toBeGreaterThan(0);
  });


});
