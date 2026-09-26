// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { WaitlistBlock } from "./WaitlistBlock";

vi.stubGlobal("React", React);

beforeAll(() => {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor() {}
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

const renderBlock = () => render(React.createElement(WaitlistBlock, { locale: "en", source: "landing" }));

describe("WaitlistBlock", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders an accessible, labelled email field and CTA", () => {
    renderBlock();
    expect(screen.getByRole("heading", { name: /get early access/i })).toBeTruthy();
    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /get early access/i })).toBeTruthy();
  });

  it("shows an inline error for an invalid email without calling the network", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderBlock();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "nope" } });
    fireEvent.click(screen.getByRole("button", { name: /get early access/i }));
    expect(await screen.findByText(/looks incomplete/i)).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows the success state after the worker accepts the signup", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    renderBlock();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "host@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /get early access/i }));
    await waitFor(() => expect(screen.getByRole("heading", { name: /you're on the list/i })).toBeTruthy());
  });

  it("shows a friendly error when rate limited", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ ok: false, error: "rate_limited" }), { status: 429 }));
    renderBlock();
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "host@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /get early access/i }));
    expect(await screen.findByText(/too many tries/i)).toBeTruthy();
  });
});
