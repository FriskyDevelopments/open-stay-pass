export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  publicAppUrl: process.env.PUBLIC_APP_URL ?? "",
  storagePublicPrefixes: (process.env.STORAGE_PUBLIC_PREFIXES ?? "public/,generated/")
    .split(",")
    .map(prefix => prefix.trim())
    .filter(Boolean),
  sessionMaxAgeMs: Number.parseInt(process.env.SESSION_MAX_AGE_MS ?? "604800000", 10),
};

export function getPublicAppOrigin() {
  const candidates = [
    ENV.publicAppUrl,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    process.env.NODE_ENV === "development" ? `http://localhost:${process.env.PORT ?? "3000"}` : "",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" || (process.env.NODE_ENV === "development" && url.protocol === "http:")) {
        return url.origin;
      }
    } catch {
      // Ignore malformed deployment configuration and try the next safe fallback.
    }
  }

  throw new Error("PUBLIC_APP_URL must be configured with a valid HTTPS origin.");
}
