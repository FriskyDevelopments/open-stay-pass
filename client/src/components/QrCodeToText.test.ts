// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { decodeQrPixels, isSupportedSignedTarget, QrCodeToText } from "./QrCodeToText";

vi.stubGlobal("React", React);

function mockImage(firstPixel: number) {
  Object.defineProperty(globalThis, "Image", { configurable: true, value: class {
    naturalWidth = 1; naturalHeight = 1; onload?: () => void; onerror?: () => void;
    set src(_value: string) { queueMicrotask(() => this.onload?.()); }
  } });
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: () => "blob:qr" });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: () => undefined });
  vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
    if (tag === "canvas") return { width: 0, height: 0, getContext: () => ({ drawImage: () => undefined, getImageData: () => ({ data: new Uint8ClampedArray([firstPixel]), width: 1, height: 1 }) }) } as unknown as HTMLCanvasElement;
    return document.createElementNS("http://www.w3.org/1999/xhtml", tag);
  }) as typeof document.createElement);
}

vi.mock("jsqr", () => ({ default: (data: Uint8ClampedArray) => data[0] === 1 ? { data: "https://folios.works/handoff/signed-token" } : null }));

describe("QR decoded target safety", () => {
  it("decodes a successful QR payload and accepts its signed route", () => {
    const decoded = decodeQrPixels(new Uint8ClampedArray([1]), 1, 1);
    expect(decoded).toBe("https://folios.works/handoff/signed-token");
    expect(isSupportedSignedTarget(decoded!)).toBe(true);
  });

  it("returns null for an unreadable image payload", () => {
    expect(decodeQrPixels(new Uint8ClampedArray([0]), 1, 1)).toBeNull();
  });

  it("renders an unreadable-image error", async () => {
    mockImage(0);
    render(React.createElement(QrCodeToText, { locale: "es" }));
    fireEvent.change(screen.getByLabelText("Seleccionar imagen"), { target: { files: [new File(["qr"], "qr.png", { type: "image/png" })] } });
    expect((await screen.findByRole("alert")).textContent).toContain("No se pudo leer el QR");
  });

  it("opens the verified signed-link action after a successful decode", async () => {
    mockImage(1);
    const onVerify = vi.fn();
    render(React.createElement(QrCodeToText, { locale: "en", onVerify }));
    fireEvent.change(screen.getByLabelText("Choose image"), { target: { files: [new File(["qr"], "qr.png", { type: "image/png" })] } });
    const verifyButton = await screen.findByRole("button", { name: "Open and validate link" });
    fireEvent.click(verifyButton);
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith("https://folios.works/handoff/signed-token"));
  });

  it("rejects non-links and unrelated destinations", () => {
    expect(isSupportedSignedTarget("not a URL")).toBe(false);
    expect(isSupportedSignedTarget("javascript:alert(1)")).toBe(false);
    expect(isSupportedSignedTarget("https://example.com/account")).toBe(false);
  });
});
