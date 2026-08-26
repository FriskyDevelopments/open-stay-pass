export type SupportLink = {
  id: "kofi" | "nowpayments" | "wise";
  label: { es: string; en: string };
  href: string;
};

const OFFICIAL_SUPPORT_DEFAULTS = {
  kofi: "https://ko-fi.com/friskypup",
  nowpayments: "https://nowpayments.io/donation/Frisky",
  wise: "https://wise.com/pay/business/friskydevelopmentsllc",
};

const OFFICIAL_GITHUB_REPOSITORY_URL = "https://github.com/FriskyDevelopments/open-stay-pass";

function getVerifiedUrl(value: string | undefined, hostname: string, pathPrefix?: string) {
  const candidate = value?.trim();
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    const validPath = !pathPrefix || url.pathname.startsWith(pathPrefix);
    return url.protocol === "https:" && url.hostname === hostname && validPath ? url.toString() : null;
  } catch {
    return null;
  }
}

export function getSupportLinks(config = {
  kofi: import.meta.env.VITE_KOFI_URL || OFFICIAL_SUPPORT_DEFAULTS.kofi,
  nowpayments: import.meta.env.VITE_NOWPAYMENTS_URL || OFFICIAL_SUPPORT_DEFAULTS.nowpayments,
  wise: import.meta.env.VITE_WISE_URL || OFFICIAL_SUPPORT_DEFAULTS.wise,
}): SupportLink[] {
  const links: SupportLink[] = [];
  const kofi = getVerifiedUrl(config.kofi, "ko-fi.com");
  const nowpayments = getVerifiedUrl(config.nowpayments, "nowpayments.io", "/donation/");
  const wise = getVerifiedUrl(config.wise, "wise.com", "/pay/business/");
  if (kofi) links.push({ id: "kofi", label: { es: "Ko-fi", en: "Ko-fi" }, href: kofi });
  if (nowpayments) links.push({ id: "nowpayments", label: { es: "NOWPayments", en: "NOWPayments" }, href: nowpayments });
  if (wise) links.push({ id: "wise", label: { es: "Wise Business", en: "Wise Business" }, href: wise });
  return links;
}

export function getGitHubRepositoryUrl(value = import.meta.env.VITE_GITHUB_REPOSITORY_URL || OFFICIAL_GITHUB_REPOSITORY_URL) {
  return getVerifiedUrl(value, "github.com");
}
