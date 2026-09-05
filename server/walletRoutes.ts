import type { Express, Request } from "express";
import { getHandoffById } from "./openStayDb";
import { resolvePublicCredential } from "./publicCredential";
import { createAppleFoliosPass, walletReadiness } from "./wallet/walletIssuer";

function localeFromRequest(request: Request) {
  return request.query.locale === "en" ? "en" : "es" as const;
}

function publicOrigin(request: Request) {
  const allowedOrigins = (process.env.CORS_ORIGINS ?? "https://staypass.dev,https://staypass-pmz7aqns.manus.space")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const referer = request.get("referer");
  if (referer) {
    try {
      const origin = new URL(referer).origin;
      if (allowedOrigins.includes(origin)) return origin;
    } catch {
      // Fall through to the configured default.
    }
  }
  return process.env.FOLIOS_PUBLIC_ORIGIN?.replace(/\/$/, "") ?? allowedOrigins[0] ?? `${request.protocol}://${request.get("host")}`;
}

export function registerWalletRoutes(app: Express) {
  app.get("/wallet/apple", async (request, response) => {
    try {
      const token = typeof request.query.token === "string" ? request.query.token : "";
      if (!token) return response.status(400).json({ error: "A signed Folios handoff token is required." });
      if (!walletReadiness("apple")) return response.status(503).json({ error: "Apple Wallet configuration is incomplete." });

      const credential = await resolvePublicCredential(token, "handoff");
      if (!credential.handoffId) return response.status(404).json({ error: "The related Folios handoff is unavailable." });
      const handoff = await getHandoffById(credential.handoffId);
      if (!handoff) return response.status(404).json({ error: "The related Folios handoff is unavailable." });
      if (handoff.invoiceStatus !== "issued" || !handoff.invoiceNumber) {
        return response.status(409).json({ error: "Only an issued CFDI can be added to Wallet." });
      }

      const locale = localeFromRequest(request);
      const handoffUrl = `${publicOrigin(request)}/handoff/${encodeURIComponent(token)}`;
      const pass = await createAppleFoliosPass({
        title: handoff.title,
        invoiceNumber: handoff.invoiceNumber,
        invoiceStatus: "issued",
        ownerName: handoff.ownerName,
        handoffUrl,
        serial: `folios-${handoff.id}`,
        updatedAt: handoff.invoiceUpdatedAt ?? handoff.invoiceIssuedAt,
      }, locale);

      response
        .status(200)
        .setHeader("Content-Type", "application/vnd.apple.pkpass")
        .setHeader("Content-Disposition", `attachment; filename="folios-${handoff.invoiceNumber}.pkpass"`)
        .setHeader("Cache-Control", "private, no-store")
        .send(pass);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create the Apple Wallet pass.";
      response.status(500).json({ error: message });
    }
  });
}
