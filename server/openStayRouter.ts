import { TRPCError } from "@trpc/server";
import QRCode from "qrcode";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  completeHandoff,
  createOperatorNotification,
  createHandoffWithCredential,
  createStayWithCredential,
  getCredentialById,
  getHandoffById,
  getOperatorNotificationSettings,
  getStayById,
  listOperatorRecords,
  recordCredentialActivity,
  revokeCredentialForOperator,
  updateOperatorNotificationSettings,
} from "./openStayDb";
import { credentialAccessState, decryptCredentialToken, encryptCredentialToken, hashCredentialToken, issueCredentialToken } from "./credentialService";
import type { IntegrationPlan, Locale, WalletAdapterStatus } from "../shared/openStay";
import { randomUUID } from "node:crypto";
import { resolveConciergeRuntime } from "./conciergeConfig";
import { instantAmenityAnswer } from "./amenityAnswers";

const localeSchema = z.enum(["es", "en"]);
const urlSchema = z.string().url().refine(value => value.startsWith("http://") || value.startsWith("https://"), "A valid public base URL is required.");

function text(locale: Locale, spanish: string, english: string) {
  return locale === "es" ? spanish : english;
}

function path(baseUrl: string, route: "arrival" | "handoff", token: string) {
  return `${baseUrl.replace(/\/$/, "")}/${route}/${encodeURIComponent(token)}`;
}

async function resolvePublicCredential(token: string, scope: "arrival" | "handoff") {
  const preview = token.split(".")[0];
  if (!preview) throw new TRPCError({ code: "UNAUTHORIZED", message: "This credential link is invalid or expired." });
  let credentialId: string;
  try { credentialId = JSON.parse(Buffer.from(preview, "base64url").toString("utf8")).credentialId; } catch { throw new TRPCError({ code: "UNAUTHORIZED", message: "This credential link is invalid or expired." }); }
  const credential = await getCredentialById(credentialId);
  if (!credential) throw new TRPCError({ code: "UNAUTHORIZED", message: "This credential is no longer valid." });
  const state = credentialAccessState({ token, expectedScope: scope, storedTokenHash: credential.tokenHash, status: credential.status, expiresAt: credential.expiresAt });
  if (state === "revoked") throw new TRPCError({ code: "FORBIDDEN", message: "This credential has been revoked by the operator." });
  if (state === "expired") throw new TRPCError({ code: "UNAUTHORIZED", message: "This credential has expired." });
  if (state !== "active") throw new TRPCError({ code: "UNAUTHORIZED", message: "This credential link is invalid or expired." });
  return credential;
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
  const settings = await getOperatorNotificationSettings(input.operatorId);
  const canPush = input.shouldNotify && settings.enabled && settings.channel === "project_owner_push";
  const delivered = canPush ? await notifyOwner({ title: input.titleEs, content: input.detailEs }) : false;
  await createOperatorNotification({
    ...input,
    deliveryStatus: canPush ? (delivered ? "delivered" : "unavailable") : "queued",
  });
}

const walletStatus = (platform: "apple" | "google", locale: Locale): WalletAdapterStatus => {
  const ready = platform === "apple"
    ? Boolean(process.env.APPLE_PASS_TYPE_ID && process.env.APPLE_TEAM_ID)
    : Boolean(process.env.GOOGLE_WALLET_ISSUER_ID);
  return ready
    ? { platform, state: "ready", message: text(locale, "La configuración de Wallet está disponible para un adaptador de aprovisionamiento en servidor.", "Wallet configuration is available for a server-side provisioning adapter."), required: [] }
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
    integrations: publicProcedure.input(z.object({ locale: localeSchema })).query(({ input }) => integrations(input.locale)),
    arrival: publicProcedure.input(z.object({ token: z.string(), locale: localeSchema })).query(async ({ input }) => {
      const credential = await resolvePublicCredential(input.token, "arrival");
      if (!credential.stayId) throw new TRPCError({ code: "NOT_FOUND", message: "The related stay no longer exists." });
      const stay = await getStayById(credential.stayId);
      if (!stay) throw new TRPCError({ code: "NOT_FOUND", message: "The related stay no longer exists." });
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
      return { credential: { id: credential.id, status: credential.status, expiresAt: credential.expiresAt }, handoff };
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
    concierge: publicProcedure.input(z.object({ token: z.string(), locale: localeSchema, question: z.string().trim().min(2).max(500) })).mutation(async ({ input }) => {
      const credential = await resolvePublicCredential(input.token, "arrival");
      if (!credential.stayId) throw new TRPCError({ code: "NOT_FOUND", message: "The related stay no longer exists." });
      const stay = await getStayById(credential.stayId);
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
      baseUrl: urlSchema,
    })).mutation(async ({ ctx, input }) => {
      if (input.departureAt <= input.arrivalAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Departure must follow arrival." });
      const stayId = randomUUID();
      const credentialId = randomUUID();
      const expiresAt = new Date(input.departureAt.getTime() + 24 * 60 * 60 * 1000);
      const token = issueCredentialToken({ credentialId, scope: "arrival", expiresAt: expiresAt.getTime() });
      const arrivalUrl = path(input.baseUrl, "arrival", token);
      await createStayWithCredential({
        stay: { id: stayId, operatorId: ctx.user.id, propertyName: input.propertyName, guestName: input.guestName, guestLocale: input.guestLocale, wifiName: input.wifiName || null, wifiPassword: input.wifiPassword || null, houseRules: input.houseRules || null, localRecommendations: input.localRecommendations || null, arrivalAt: input.arrivalAt, departureAt: input.departureAt },
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
      baseUrl: urlSchema,
    })).mutation(async ({ ctx, input }) => {
      const handoffId = randomUUID();
      const credentialId = randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const token = issueCredentialToken({ credentialId, scope: "handoff", expiresAt: expiresAt.getTime() });
      const handoffUrl = path(input.baseUrl, "handoff", token);
      await createHandoffWithCredential({
        handoff: { id: handoffId, operatorId: ctx.user.id, title: input.title, sourceType: input.sourceType, sourceContent: input.sourceContent, context: input.context, checkState: input.checkState, ownerName: input.ownerName, status: "shared" },
        credential: { id: credentialId, operatorId: ctx.user.id, stayId: null, handoffId, type: "handoff", status: "active", tokenHash: hashCredentialToken(token), ...encryptCredentialToken(token), expiresAt },
      });
      return { handoffId, credentialId, token, handoffUrl, qrDataUrl: await QRCode.toDataURL(handoffUrl, { margin: 1, width: 720, color: { dark: "#10251d", light: "#00000000" } }), expiresAt };
    }),
    revokeCredential: protectedProcedure.input(z.object({ credentialId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
      const revoked = await revokeCredentialForOperator(input.credentialId, ctx.user.id);
      if (!revoked) throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found." });
      return { revoked: true };
    }),
    shareCredential: protectedProcedure.input(z.object({ credentialId: z.string().uuid(), baseUrl: urlSchema })).mutation(async ({ ctx, input }) => {
      const credential = await getCredentialById(input.credentialId);
      if (!credential || credential.operatorId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found." });
      if (credential.status !== "active" || credential.expiresAt.getTime() < Date.now()) throw new TRPCError({ code: "FORBIDDEN", message: "Only active credentials can be shared." });
      const token = decryptCredentialToken(credential);
      if (!token) throw new TRPCError({ code: "CONFLICT", message: "This legacy credential cannot be recovered. Create a replacement credential." });
      const route = credential.type === "arrival" ? "arrival" : "handoff";
      const link = path(input.baseUrl, route, token);
      return { link, nfcUri: credential.type === "arrival" ? link : null, qrDataUrl: await QRCode.toDataURL(link, { margin: 1, width: 720, color: { dark: credential.type === "arrival" ? "#07121b" : "#10251d", light: "#00000000" } }) };
    }),
    notificationSettings: protectedProcedure.query(({ ctx }) => getOperatorNotificationSettings(ctx.user.id)),
    updateNotificationSettings: protectedProcedure.input(z.object({ channel: z.enum(["project_owner_push", "in_app_only"]), enabled: z.boolean() })).mutation(({ ctx, input }) => updateOperatorNotificationSettings({ operatorId: ctx.user.id, ...input })),
  }),
});
