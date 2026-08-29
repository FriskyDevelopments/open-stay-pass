import { and, desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { activityEvents, credentials, handoffs, operatorNotificationSettings, operatorNotifications, stays } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { decryptSecret } from "./credentialService";

export async function createStayWithCredential(input: {
  stay: typeof stays.$inferInsert;
  credential: typeof credentials.$inferInsert;
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable.");
  await db.transaction(async tx => {
    await tx.insert(stays).values(input.stay);
    await tx.insert(credentials).values(input.credential);
  });
  return input;
}

export async function createHandoffWithCredential(input: {
  handoff: typeof handoffs.$inferInsert;
  credential: typeof credentials.$inferInsert;
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable.");
  await db.transaction(async tx => {
    await tx.insert(handoffs).values(input.handoff);
    await tx.insert(credentials).values(input.credential);
  });
  return input;
}

export async function getCredentialById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(credentials).where(eq(credentials.id, id)).limit(1);
  return result[0];
}

export async function getStayById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stays).where(eq(stays.id, id)).limit(1);
  const stay = result[0];
  if (!stay) return undefined;
  return {
    ...stay,
    wifiPassword: decryptSecret({
      ciphertext: stay.wifiPasswordCiphertext,
      iv: stay.wifiPasswordIv,
      tag: stay.wifiPasswordTag,
    }) ?? stay.wifiPassword,
  };
}

export async function getHandoffInvoiceHistory(handoffId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ type: activityEvents.type, metadata: activityEvents.metadata, locale: activityEvents.locale, createdAt: activityEvents.createdAt }).from(activityEvents).where(eq(activityEvents.handoffId, handoffId)).orderBy(desc(activityEvents.createdAt));
}

export async function getHandoffById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(handoffs).where(eq(handoffs.id, id)).limit(1);
  return result[0];
}

export async function recordCredentialActivity(input: {
  operatorId: number;
  credentialId: string;
  handoffId?: string | null;
  type: "arrival_scan" | "handoff_completed" | "credential_revoked";
  locale?: "es" | "en";
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  if (!db) return { shouldNotify: false };
  const credential = await getCredentialById(input.credentialId);
  const shouldNotify = input.type !== "arrival_scan" || shouldNotifyArrival(credential?.lastUsedAt);
  await db.update(credentials).set({ lastUsedAt: new Date() }).where(eq(credentials.id, input.credentialId));
  await db.insert(activityEvents).values({
    operatorId: input.operatorId,
    credentialId: input.credentialId,
    handoffId: input.handoffId ?? null,
    type: input.type,
    locale: input.locale,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
  });
  return { shouldNotify };
}

export function shouldNotifyArrival(lastUsedAt?: Date | null, now = Date.now()) {
  return !lastUsedAt || now - lastUsedAt.getTime() > 60 * 60 * 1000;
}

export async function getOperatorNotificationSettings(operatorId: number) {
  const db = await getDb();
  if (!db) return { operatorId, channel: "in_app_only" as const, enabled: true };
  const setting = await db.select().from(operatorNotificationSettings).where(eq(operatorNotificationSettings.operatorId, operatorId)).limit(1);
  return setting[0] ?? { operatorId, channel: "project_owner_push" as const, enabled: true };
}

export async function updateOperatorNotificationSettings(input: { operatorId: number; channel: "project_owner_push" | "in_app_only"; enabled: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable.");
  await db.insert(operatorNotificationSettings).values(input).onDuplicateKeyUpdate({ set: { channel: input.channel, enabled: input.enabled } });
  return input;
}

export async function createOperatorNotification(input: {
  operatorId: number;
  credentialId?: string | null;
  handoffId?: string | null;
  type: "arrival_scan" | "handoff_completed" | "invoice_issued";
  titleEs: string;
  titleEn: string;
  detailEs: string;
  detailEn: string;
  deliveryStatus: "delivered" | "unavailable" | "queued";
}) {
  const db = await getDb();
  if (!db) return { channel: "in_app_only" as const, enabled: true };
  const settings = await getOperatorNotificationSettings(input.operatorId);
  const canPush = settings.enabled && settings.channel === "project_owner_push";
  const delivered = canPush ? await notifyOwner({ title: input.titleEs, content: input.detailEs }) : false;
  await db.insert(operatorNotifications).values({
    ...input,
    deliveryStatus: canPush ? (delivered ? "delivered" : "unavailable") : "queued",
    credentialId: input.credentialId ?? null,
    handoffId: input.handoffId ?? null,
    deliveryChannel: settings.channel,
  });
  return settings;
}

export async function revokeCredentialForOperator(credentialId: string, operatorId: number) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable.");
  const current = await db
    .select()
    .from(credentials)
    .where(and(eq(credentials.id, credentialId), eq(credentials.operatorId, operatorId)))
    .limit(1);
  if (!current[0]) return false;
  await db
    .update(credentials)
    .set({ status: "revoked", revokedAt: new Date() })
    .where(eq(credentials.id, credentialId));
  await db.insert(activityEvents).values({
    operatorId,
    credentialId,
    type: "credential_revoked",
  });
  return true;
}

export async function completeHandoff(input: { credentialId: string; handoffId: string; operatorId: number; locale: "es" | "en" }) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable.");
  await db.update(handoffs).set({ status: "completed" }).where(eq(handoffs.id, input.handoffId));
  return recordCredentialActivity({
    operatorId: input.operatorId,
    credentialId: input.credentialId,
    handoffId: input.handoffId,
    type: "handoff_completed",
    locale: input.locale,
  });
}

export async function listOperatorRecords(operatorId: number) {
  const db = await getDb();
  if (!db) return { stays: [], handoffs: [], credentials: [], events: [], notifications: [], notificationSettings: { operatorId, channel: "in_app_only" as const, enabled: true } };
  const [operatorStays, operatorHandoffs, operatorCredentials, events, notifications, notificationSettings] = await Promise.all([
    db.select().from(stays).where(eq(stays.operatorId, operatorId)).orderBy(desc(stays.createdAt)),
    db.select().from(handoffs).where(eq(handoffs.operatorId, operatorId)).orderBy(desc(handoffs.createdAt)),
    db.select().from(credentials).where(eq(credentials.operatorId, operatorId)).orderBy(desc(credentials.createdAt)),
    db.select().from(activityEvents).where(eq(activityEvents.operatorId, operatorId)).orderBy(desc(activityEvents.createdAt)).limit(24),
    db.select().from(operatorNotifications).where(eq(operatorNotifications.operatorId, operatorId)).orderBy(desc(operatorNotifications.createdAt)).limit(12),
    getOperatorNotificationSettings(operatorId),
  ]);
  return {
    stays: operatorStays.map(({ wifiPassword, wifiPasswordCiphertext, wifiPasswordIv, wifiPasswordTag, ...stay }) => stay),
    handoffs: operatorHandoffs,
    credentials: operatorCredentials.map(({ tokenHash, tokenCiphertext, tokenIv, tokenTag, ...credential }) => credential),
    events,
    notifications,
    notificationSettings,
  };
}

export type InvoiceStatus = "proof" | "review" | "issued" | "cancelled";

const allowedInvoiceTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  proof: ["review", "cancelled"],
  review: ["issued", "cancelled", "proof"],
  issued: ["cancelled"],
  cancelled: [],
};

export function canTransitionInvoice(from: InvoiceStatus, to: InvoiceStatus) {
  return from === to || allowedInvoiceTransitions[from].includes(to);
}

export async function updateHandoffInvoice(input: {
  handoffId: string;
  operatorId: number;
  invoiceStatus: InvoiceStatus;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
  locale: "es" | "en";
}) {
  const db = await getDb();
  if (!db) throw new Error("The database is unavailable.");
  const current = await getHandoffById(input.handoffId);
  if (!current || current.operatorId !== input.operatorId) return { ok: false as const, reason: "not_found" as const };
  if (current.invoiceStatus === input.invoiceStatus) return { ok: true as const, handoff: current, changed: false };
  if (!allowedInvoiceTransitions[current.invoiceStatus as InvoiceStatus]?.includes(input.invoiceStatus)) return { ok: false as const, reason: "invalid_transition" as const };
  const now = new Date();
  await db.update(handoffs).set({
    invoiceStatus: input.invoiceStatus,
    invoiceNumber: input.invoiceNumber ?? current.invoiceNumber ?? null,
    invoiceUrl: input.invoiceUrl ?? current.invoiceUrl ?? null,
    invoiceIssuedAt: input.invoiceStatus === "issued" ? now : current.invoiceIssuedAt,
    invoiceUpdatedAt: now,
  }).where(and(eq(handoffs.id, input.handoffId), eq(handoffs.operatorId, input.operatorId)));
  await db.insert(activityEvents).values({
    operatorId: input.operatorId,
    handoffId: input.handoffId,
    type: input.invoiceStatus === "issued" ? "invoice_issued" : "invoice_status_changed",
    locale: input.locale,
    metadata: JSON.stringify({ from: current.invoiceStatus, to: input.invoiceStatus, invoiceNumber: input.invoiceNumber ?? null }),
  });
  if (input.invoiceStatus === "issued") {
    await createOperatorNotification({
      operatorId: input.operatorId,
      handoffId: input.handoffId,
      type: "invoice_issued",
      titleEs: "Factura emitida",
      titleEn: "Invoice issued",
      detailEs: `El comprobante “${current.title}” ahora tiene factura emitida${input.invoiceNumber ? ` · ${input.invoiceNumber}` : ""}.`,
      detailEn: `The proof slip “${current.title}” now has an issued invoice${input.invoiceNumber ? ` · ${input.invoiceNumber}` : ""}.`,
      deliveryStatus: "queued",
    });
  }
  return { ok: true as const, changed: true, handoff: await getHandoffById(input.handoffId) };
}
