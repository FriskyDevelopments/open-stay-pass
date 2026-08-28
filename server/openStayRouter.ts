import { TRPCError } from "@trpc/server";
import QRCode from "qrcode";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  completeHandoff,
  createOperatorNotification,
  createHandoffWithCredential,
  createStayWithCredential,
  getCredentialById,
  getHandoffById,
  getHandoffInvoiceHistory,
  getStayById,
  listOperatorRecords,
  recordCredentialActivity,
  revokeCredentialForOperator,
  updateOperatorNotificationSettings,
  updateHandoffInvoice,
} from "./openStayDb";
import { decryptCredentialToken, encryptCredentialToken, encryptSecret, hashCredentialToken, issueCredentialToken } from "./credentialService";
import { getPublicAppOrigin } from "./_core/env";
import type { IntegrationPlan, Locale, WalletAdapterStatus } from "../shared/openStay";
import { randomUUID } from "node:crypto";
import { resolveConciergeRuntime } from "./conciergeConfig";
import { instantAmenityAnswer } from "./amenityAnswers";
import { createPreviewStay, getPreviewStay } from "./previewStay";
import { resolvePublicCredential } from "./publicCredential";
import { createGoogleFoliosSaveUrl, walletReadiness } from "./wallet/walletIssuer";

const localeSchema = z.enum(["es", "en"]);
const conciergeRequests = new Map<string, { count: number; resetAt: number }>();
const CONCIERGE_WINDOW_MS = 60_000;
const CONCIERGE_LIMIT = 10;

function enforceConciergeRateLimit(key: string) {
  const now = Date.now();
  const current = conciergeRequests.get(key);
  if (!current || current.resetAt <= now) {
    conciergeRequests.set(key, { count: 1, resetAt: now + CONCIERGE_WINDOW_MS });
    return;
  }
  if (current.count >= CONCIERGE_LIMIT) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many concierge requests. Please try again shortly." });
  }
  current.count += 1;
}

function text(locale: Locale, spanish: string, english: string) {
  return locale === "es" ? spanish : english;
}

function path(baseUrl: string, route: "arrival" | "handoff", token: string) {
  return `${baseUrl.replace(/\/$/, "")}/${route}/${encodeURIComponent(token)}`;
}

async function notifyForEvent(input: {
  operatorId: number;
  credentialId: string;
  handoffId?: string | null;
  type: "arrival_scan" | "handoff_completed";
  titleEs: string;
  titleEn: string;
  detailEs: string;
  detailEn: string;
  shouldNotify: boolean;
}) {
  if (!input.shouldNotify) return;
  await createOperatorNotification({
    ...input,
    deliveryStatus: "queued",
  });
}

const walletStatus = (platform: "apple" | "google", locale: Locale): WalletAdapterStatus => {
  const ready = walletReadiness(platform);
  return ready
    ? { platform, state: "ready", message: platform === "apple" ? text(locale, "La firma de Apple Wallet está configurada. Las facturas CFDI emitidas pueden descargarse como un pase real.", "Apple Wallet signing is configured. Issued CFDI invoices can be downloaded as a real pass.") : text(locale, "Google Wallet está configurado. Las facturas CFDI emitidas pueden abrir el flujo oficial Add to Google Wallet.", "Google Wallet is configured. Issued CFDI invoices can open the official Add to Google Wallet flow."), required: [] }
    : {
        platform,
        state: "configuration_required",
        message: platform === "apple"
          ? text(locale, "Apple Wallet requiere un Pass Type ID, Team ID, certificado de firma y entitlement de producción antes de emitir pases.", "Apple Wallet requires a Pass Type ID, Team ID, signing certificate, and production entitlement before passes can be issued.")
          : text(locale, "Google Wallet requiere una cuenta de emisor, cuenta de servicio y configuración de clase antes de emitir pases.", "Google Wallet requires an issuer account, service account, and class configuration before passes can be issued."),
        required: platform === "apple" ? ["Pass Type ID", "Team ID", text(locale, "certificado de firma", "signing certificate"), text(locale, "entitlement NFC si aplica", "NFC entitlement if applicable")] : [text(locale, "cuenta de emisor", "issuer account"), text(locale, "cuenta de servicio", "service account"), text(locale, "clase de pase", "pass class")],
      };
};

const integrations = (locale: Locale): IntegrationPlan[] => [
  { name: "Google Calendar", category: "Nango", state: "available", description: text(locale, "Sincronización opcional de llegada y salida después de conectar un calendario.", "Optional arrival and departure synchronization after an operator connects a calendar.") },
  { name: "Email", category: "Nango", state: "available", description: text(locale, "Entrega opcional de enlaces de llegada y handoffs de Folios mediante un proveedor de correo conectado.", "Optional delivery of arrival links and Folios handoffs through connected email providers.") },
  { name: "Stripe", category: "Nango", state: "available", description: text(locale, "Contexto opcional del estado de pago; las credenciales nunca contienen datos de pago.", "Optional payment-status context; credentials never contain payment data.") },
  { name: text(locale, "PMS y channel managers", "PMS and channel managers"), category: "Custom", state: "design_required", description: text(locale, "Agregar solo después de seleccionar un proveedor y verificar su API, permisos y términos comerciales.", "Add only after the operator selects a provider and its API, permissions, and commercial terms are verified.") },
  { name: text(locale, "Cerraduras inteligentes", "Smart locks"), category: "Custom", state: "design_required", description: text(locale, "Mantener la provisión de cerradura separada de los payloads de QR y Wallet; mostrar estados explícitos.", "Keep lock provisioning separate from QR and Wallet payloads; expose explicit capability states.") },
];

export const openStayRouter = router({
  public: router({
    walletStatus: publicProcedure.input(z.object({ platform: z.enum(["apple", "google"]), locale: localeSchema })).query(({ input }) => walletStatus(input.platform, input.locale)),
    googleWalletSave: publicProcedure.input(z.object({ token: z.string(), locale: localeSchema })).mutation(async ({ input }) => {
      if (!walletReadiness("google")) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Google Wallet configuration is incomplete." });
      const credential = await resolvePublicCredential(input.token, "handoff");
      if (!credential.handoffId) throw new TRPCError({ code: "NOT_FOUND", message: "The related Folios handoff is unavailable." });
      const handoff = await getHandoffById(credential.handoffId);
      if (!handoff) throw new TRPCError({ code: "NOT_FOUND", message: "The related Folios handoff is unavailable." });
      if (handoff.invoiceStatus !== "issued" || !handoff.invoiceNumber) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only an issued CFDI can be added to Wallet." });
      }
      const handoffUrl = path(getPublicAppOrigin(), "handoff", input.token);
      return {
        saveUrl: createGoogleFoliosSaveUrl({
          title: handoff.title,
          invoiceNumber: handoff.invoiceNumber,
          invoiceStatus: "issued",
          ownerName: handoff.ownerName,
          handoffUrl,
          serial: `folios-${handoff.id}`,
          updatedAt: handoff.invoiceUpdatedAt ?? handoff.invoiceIssuedAt,
        }, input.locale),
      };
    }),
    integrations: publicProcedure.input(z.object({ locale: localeSchema })).query(({ input }) => integrations(input.locale)),
    previewToken: publicProcedure.query(() => ({ token: createPreviewStay() })),
    arrival: publicProcedure.input(z.object({ token: z.string(), locale: localeSchema })).query(async ({ input }) => {
      const credential = await resolvePublicCredential(input.token, "arrival");
      if (!credential.stayId) throw new TRPCError({ code: "NOT_FOUND", message: "The related stay no longer exists." });
      const stay = getPreviewStay(input.token)?.stay ?? await getStayById(credential.stayId);
      if (!stay) throw new TRPCError({ code: "NOT_FOUND", message: "The related stay no longer exists." });
      if (getPreviewStay(input.token)) return { credential: { id: credential.id, status: credential.status, expiresAt: credential.expiresAt }, stay };
      const activity = await recordCredentialActivity({ operatorId: credential.operatorId, credentialId: credential.id, type: "arrival_scan", locale: input.locale });
      await notifyForEvent({
        operatorId: credential.operatorId,
        credentialId: credential.id,
        type: "arrival_scan",
        titleEs: "HostCasa: enlace de llegada abierto",
        titleEn: "HostCasa: arrival link opened",
        detailEs: `${stay.guestName} abrió el enlace de llegada de ${stay.propertyName}.`,
        detailEn: `${stay.guestName} opened the arrival link for ${stay.propertyName}.`,
        shouldNotify: activity.shouldNotify,
      });
      return { credential: { id: credential.id, status: credential.status, expiresAt: credential.expiresAt }, stay };
    }),
    handoff: publicProcedure.input(z.object({ token: z.string(), locale: localeSchema })).query(async ({ input }) => {
      const credential = await resolvePublicCredential(input.token, "handoff");
      if (!credential.handoffId) throw new TRPCError({ code: "NOT_FOUND", message: "The related handoff no longer exists." });
      const handoff = await getHandoffById(credential.handoffId);
      if (!handoff) throw new TRPCError({ code: "NOT_FOUND", message: "The related handoff no longer exists." });
      const history = (await getHandoffInvoiceHistory(handoff.id)).filter(event => event.type === "invoice_issued" || event.type === "invoice_status_changed");
      return { credential: { id: credential.id, status: credential.status, expiresAt: credential.expiresAt }, handoff, invoiceHistory: history };
    }),
    completeHandoff: publicProcedure.input(z.object({ token: z.string(), locale: localeSchema })).mutation(async ({ input }) => {
      const credential = await resolvePublicCredential(input.token, "handoff");
      if (!credential.handoffId) throw new TRPCError({ code: "NOT_FOUND", message: "The related handoff no longer exists." });
      const activity = await completeHandoff({ credentialId: credential.id, handoffId: credential.handoffId, operatorId: credential.operatorId, locale: input.locale });
      const handoff = await getHandoffById(credential.handoffId);
      await notifyForEvent({
        operatorId: credential.operatorId,
        credentialId: credential.id,
        handoffId: credential.handoffId,
        type: "handoff_completed",
        titleEs: "Folios: handoff completado",
        titleEn: "Folios: handoff completed",
        detailEs: `${handoff?.title ?? "Un handoff de Folios"} se marcó como completado desde su enlace seguro.`,
        detailEn: `${handoff?.title ?? "A Folios handoff"} was marked complete from its signed link.`,
        shouldNotify: activity.shouldNotify,
      });
      return { completed: true };
    }),
    concierge: publicProcedure.input(z.object({ token: z.string(), locale: localeSchema, question: z.string().trim().min(2).max(500) })).mutation(async ({ ctx, input }) => {
      const forwardedFor = ctx.req.headers["x-forwarded-for"];
      const requestIp = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0])?.trim() || ctx.req.ip || "unknown";
      enforceConciergeRateLimit(`${input.token}:${requestIp}`);
      const credential = await resolvePublicCredential(input.token, "arrival");
      if (!credential.stayId) throw new TRPCError({ code: "NOT_FOUND", message: "The related stay no longer exists." });
      const stay = getPreviewStay(input.token)?.stay ?? await getStayById(credential.stayId);
      if (!stay) throw new TRPCError({ code: "NOT_FOUND", message: "The related stay no longer exists." });
      const groundedContext = [
        `Property: ${stay.propertyName}`,
        `Guest: ${stay.guestName}`,
        `Wi-Fi name: ${stay.wifiName || "Not provided"}`,
        `Wi-Fi password: ${stay.wifiPassword || "Not provided"}`,
        `House rules: ${stay.houseRules || "Not provided"}`,
        `Local recommendations: ${stay.localRecommendations || "Not provided"}`,
      ].join("\n");
      const language = input.locale === "es" ? "Spanish" : "English";
      const instant = instantAmenityAnswer(input.question, input.locale, stay);
      if (instant) return { answer: instant, mode: "instant_guide" as const };
      const runtime = resolveConciergeRuntime();
      if (!runtime.usesLiveProvider) {
        return { answer: text(input.locale, "Puedo confirmar únicamente la información visible en esta guía. Para otra pregunta, contacta al operador.", "I can confirm only the information visible in this guide. For anything else, please contact the operator."), mode: "local_fallback" as const };
      }
      try {
        const response = await invokeLLM({
          model: runtime.model,
          messages: [
            {
              role: "system",
              content: `You are HostCasa ConciergeAI. Answer only from the operator-approved property context below. Reply in ${language}. If the answer is missing from the context, clearly say that you cannot confirm it and direct the guest to contact the operator. Never invent property, safety, access, location, or recommendation facts.\n\n${groundedContext}`,
            },
            { role: "user", content: input.question },
          ],
        });
        const answer = response.choices?.[0]?.message?.content;
        return { answer: typeof answer === "string" ? answer : text(input.locale, "No puedo confirmar eso con la información aprobada. Contacta al operador.", "I cannot confirm that from the approved information. Please contact the operator."), mode: "live" as const };
      } catch {
        return { answer: text(input.locale, "Puedo confirmar únicamente la información visible en esta guía. Para otra pregunta, contacta al operador.", "I can confirm only the information visible in this guide. For anything else, please contact the operator."), mode: "local_fallback" as const };
      }
    }),
  }),
  operator: router({
    dashboard: protectedProcedure.query(({ ctx }) => listOperatorRecords(ctx.user.id)),
    createStay: protectedProcedure.input(z.object({
      propertyName: z.string().trim().min(2).max(160),
      guestName: z.string().trim().min(2).max(160),
      guestLocale: localeSchema,
      wifiName: z.string().trim().max(160).optional(),
      wifiPassword: z.string().trim().max(160).optional(),
      houseRules: z.string().trim().max(4000).optional(),
      localRecommendations: z.string().trim().max(4000).optional(),
      arrivalAt: z.date(),
      departureAt: z.date(),
    })).mutation(async ({ ctx, input }) => {
      if (input.departureAt <= input.arrivalAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Departure must follow arrival." });
      const stayId = randomUUID();
      const credentialId = randomUUID();
      const expiresAt = new Date(input.departureAt.getTime() + 24 * 60 * 60 * 1000);
      const token = issueCredentialToken({ credentialId, scope: "arrival", expiresAt: expiresAt.getTime() });
      const arrivalUrl = path(getPublicAppOrigin(), "arrival", token);
      const encryptedWifiPassword = input.wifiPassword ? encryptSecret(input.wifiPassword) : null;
      await createStayWithCredential({
        stay: { id: stayId, operatorId: ctx.user.id, propertyName: input.propertyName, guestName: input.guestName, guestLocale: input.guestLocale, wifiName: input.wifiName || null, wifiPassword: null, wifiPasswordCiphertext: encryptedWifiPassword?.ciphertext ?? null, wifiPasswordIv: encryptedWifiPassword?.iv ?? null, wifiPasswordTag: encryptedWifiPassword?.tag ?? null, houseRules: input.houseRules || null, localRecommendations: input.localRecommendations || null, arrivalAt: input.arrivalAt, departureAt: input.departureAt },
        credential: { id: credentialId, operatorId: ctx.user.id, stayId, handoffId: null, type: "arrival", status: "active", tokenHash: hashCredentialToken(token), ...encryptCredentialToken(token), expiresAt },
      });
      return { stayId, credentialId, token, arrivalUrl, nfcUri: arrivalUrl, qrDataUrl: await QRCode.toDataURL(arrivalUrl, { margin: 1, width: 720, color: { dark: "#07121b", light: "#00000000" } }), expiresAt };
    }),
    createHandoff: protectedProcedure.input(z.object({
      title: z.string().trim().min(2).max(160),
      sourceType: z.enum(["note", "photo", "link"]),
      sourceContent: z.string().trim().min(2).max(4000),
      context: z.string().trim().min(2).max(2000),
      checkState: z.enum(["ready", "needs_review"]),
      ownerName: z.string().trim().min(2).max(160),
      locale: localeSchema,
    })).mutation(async ({ ctx, input }) => {
      const handoffId = randomUUID();
      const credentialId = randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const token = issueCredentialToken({ credentialId, scope: "handoff", expiresAt: expiresAt.getTime() });
      const handoffUrl = path(getPublicAppOrigin(), "handoff", token);
      await createHandoffWithCredential({
        handoff: { id: handoffId, operatorId: ctx.user.id, title: input.title, sourceType: input.sourceType, sourceContent: input.sourceContent, context: input.context, checkState: input.checkState, ownerName: input.ownerName, status: "shared" },
        credential: { id: credentialId, operatorId: ctx.user.id, stayId: null, handoffId, type: "handoff", status: "active", tokenHash: hashCredentialToken(token), ...encryptCredentialToken(token), expiresAt },
      });
      return { handoffId, credentialId, token, handoffUrl, qrDataUrl: await QRCode.toDataURL(handoffUrl, { margin: 1, width: 720, color: { dark: "#10251d", light: "#00000000" } }), expiresAt };
    }),
    updateInvoiceStatus: protectedProcedure.input(z.object({
      handoffId: z.string().uuid(),
      invoiceStatus: z.enum(["proof", "review", "issued", "cancelled"]),
      invoiceNumber: z.string().trim().max(120).optional(),
      invoiceUrl: z.string().url().max(2000).optional(),
      locale: localeSchema,
    })).mutation(async ({ ctx, input }) => {
      const result = await updateHandoffInvoice({ ...input, operatorId: ctx.user.id });
      if (!result.ok && result.reason === "not_found") throw new TRPCError({ code: "NOT_FOUND", message: "Handoff not found." });
      if (!result.ok) throw new TRPCError({ code: "BAD_REQUEST", message: "This invoice status transition is not allowed." });
      return result;
    }),
    revokeCredential: protectedProcedure.input(z.object({ credentialId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
      const revoked = await revokeCredentialForOperator(input.credentialId, ctx.user.id);
      if (!revoked) throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found." });
      return { revoked: true };
    }),
    shareCredential: protectedProcedure.input(z.object({ credentialId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
      const credential = await getCredentialById(input.credentialId);
      if (!credential || credential.operatorId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found." });
      if (credential.status !== "active" || credential.expiresAt.getTime() < Date.now()) throw new TRPCError({ code: "FORBIDDEN", message: "Only active credentials can be shared." });
      const token = decryptCredentialToken(credential);
      if (!token) throw new TRPCError({ code: "CONFLICT", message: "This legacy credential cannot be recovered. Create a replacement credential." });
      const route = credential.type === "arrival" ? "arrival" : "handoff";
      const link = path(getPublicAppOrigin(), route, token);
      return { link, nfcUri: credential.type === "arrival" ? link : null, qrDataUrl: await QRCode.toDataURL(link, { margin: 1, width: 720, color: { dark: credential.type === "arrival" ? "#07121b" : "#10251d", light: "#00000000" } }) };
    }),
    notificationSettings: protectedProcedure.query(({ ctx }) => getOperatorNotificationSettings(ctx.user.id)),
    updateNotificationSettings: protectedProcedure.input(z.object({ channel: z.enum(["project_owner_push", "in_app_only"]), enabled: z.boolean() })).mutation(({ ctx, input }) => updateOperatorNotificationSettings({ operatorId: ctx.user.id, ...input })),
  }),
});
