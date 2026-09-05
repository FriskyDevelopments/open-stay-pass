import { describe, expect, it } from "vitest";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { publicUrl, qrOptions, REPOSITORY_URL } from "./qr";

describe("community QR carriers", () => {
  it("preserves a public URL including query and fragment", () => {
    expect(publicUrl("  https://example.com/guide?lang=es#arrival  ")).toBe("https://example.com/guide?lang=es#arrival");
  });

  it.each(["javascript:alert(1)", "data:text/html,hello", "file:///etc/passwd", "https://user:password@example.com", "example.com", "", `https://example.com/${"a".repeat(2048)}`])("rejects unsupported input %s", (value) => {
    expect(() => publicUrl(value)).toThrow();
  });

  it("encodes a decodable QR with the documented colors and four-module quiet zone", async () => {
    const value = publicUrl(REPOSITORY_URL);
    const qr = QRCode.create(value, qrOptions);
    const moduleSize = 8;
    const width = (qr.modules.size + 2 * qrOptions.margin) * moduleSize;
    const pixels = new Uint8ClampedArray(width * width * 4);
    const ink = [10, 16, 24, 255];
    const paper = [242, 240, 233, 255];
    for (let y = 0; y < width; y++) for (let x = 0; x < width; x++) {
      const row = Math.floor(y / moduleSize) - qrOptions.margin;
      const col = Math.floor(x / moduleSize) - qrOptions.margin;
      const dark = row >= 0 && col >= 0 && row < qr.modules.size && col < qr.modules.size && qr.modules.get(row, col);
      pixels.set(dark ? ink : paper, (y * width + x) * 4);
    }
    expect(jsQR(pixels, width, width)?.data).toBe(value);
    const svg = await QRCode.toString(value, { ...qrOptions, type: "svg" });
    expect(svg).toContain("#0A1018");
    expect(svg).toContain("#F2F0E9");
    expect(svg).not.toContain("SIGNED QR");
  });
});
