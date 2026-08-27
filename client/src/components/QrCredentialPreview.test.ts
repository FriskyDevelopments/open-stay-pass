// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import QrCredentialPreview from "./QrCredentialPreview";

vi.stubGlobal("React", React);

describe("QrCredentialPreview copy receipt", () => {
  it("confirms a copied credential through a redacted terminal receipt", () => {
    const secretUrl = "https://staypass.example/handoff?token=secret-credential-value";
    const onCopy = vi.fn();
    render(React.createElement(QrCredentialPreview, { locale: "es", qrDataUrl: "data:image/png;base64,AA", link: secretUrl, copied: "", label: "handoff", onCopy }));

    fireEvent.click(screen.getByRole("button", { name: "Copiar enlace" }));

    expect(onCopy).toHaveBeenCalledWith(secretUrl, "handoff-link");
    const receipt = screen.getByRole("status");
    expect(receipt.textContent).toContain("$ osp.copy --surface=handoff --carrier=qr");
    expect(receipt.textContent).toContain("token:redacted");
    expect(receipt.textContent).not.toContain("secret-credential-value");
  });
});
