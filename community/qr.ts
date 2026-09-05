export const REPOSITORY_URL = "https://github.com/FriskyDevelopments/open-stay-pass";

export function publicUrl(value: string): string {
  if (value.trim().length > 2048) throw new Error("url_too_long");
  const url = new URL(value.trim());
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("public_http_url_required");
  }
  return url.href;
}

// The exported codes are URL carriers. This module has no signing key or credential authority.
export const qrOptions = {
  errorCorrectionLevel: "M" as const,
  margin: 4,
  width: 512,
  color: { dark: "#0A1018", light: "#F2F0E9" },
};
