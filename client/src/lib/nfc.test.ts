import { describe, expect, it } from "vitest";
import { ndefUrlPayload } from "./nfc";

describe("NDEF credential payload", () => {
  it("preserves the existing signed credential URL without adding a door secret", () => {
    const signedUrl = "https://staypass.example/arrival/header.signature";
    expect(ndefUrlPayload(signedUrl)).toBe(signedUrl);
  });

  it("rejects non-web payload schemes", () => {
    expect(() => ndefUrlPayload("javascript:alert(1)")).toThrow("HTTP(S)");
  });
});
