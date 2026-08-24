import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  /** Stable Supabase user id from the shared HostCasa identity provider. */
  hostcasaId: varchar("hostcasaId", { length: 255 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const stays = mysqlTable("stays", {
  id: varchar("id", { length: 36 }).primaryKey(),
  operatorId: int("operatorId").notNull(),
  propertyName: varchar("propertyName", { length: 160 }).notNull(),
  guestName: varchar("guestName", { length: 160 }).notNull(),
  guestLocale: mysqlEnum("guestLocale", ["es", "en"]).default("es").notNull(),
  wifiName: varchar("wifiName", { length: 160 }),
  wifiPassword: varchar("wifiPassword", { length: 160 }),
  houseRules: text("houseRules"),
  localRecommendations: text("localRecommendations"),
  arrivalAt: timestamp("arrivalAt").notNull(),
  departureAt: timestamp("departureAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("stays_operator_idx").on(table.operatorId)]);

export const credentials = mysqlTable("credentials", {
  id: varchar("id", { length: 36 }).primaryKey(),
  operatorId: int("operatorId").notNull(),
  stayId: varchar("stayId", { length: 36 }),
  handoffId: varchar("handoffId", { length: 36 }),
  type: mysqlEnum("type", ["arrival", "handoff"]).notNull(),
  status: mysqlEnum("status", ["active", "revoked", "expired"]).default("active").notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull(),
  tokenCiphertext: text("tokenCiphertext"),
  tokenIv: varchar("tokenIv", { length: 32 }),
  tokenTag: varchar("tokenTag", { length: 32 }),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  index("credentials_operator_idx").on(table.operatorId),
  index("credentials_stay_idx").on(table.stayId),
  index("credentials_handoff_idx").on(table.handoffId),
]);

export const handoffs = mysqlTable("handoffs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  operatorId: int("operatorId").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["note", "photo", "link"]).default("note").notNull(),
  sourceContent: text("sourceContent").notNull(),
  context: text("context").notNull(),
  checkState: mysqlEnum("checkState", ["ready", "needs_review"]).default("needs_review").notNull(),
  ownerName: varchar("ownerName", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["draft", "shared", "completed"]).default("draft").notNull(),
  invoiceStatus: mysqlEnum("invoiceStatus", ["proof", "review", "issued", "cancelled"]).default("proof").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 120 }),
  invoiceUrl: text("invoiceUrl"),
  invoiceIssuedAt: timestamp("invoiceIssuedAt"),
  invoiceUpdatedAt: timestamp("invoiceUpdatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("handoffs_operator_idx").on(table.operatorId)]);

export const activityEvents = mysqlTable("activityEvents", {
  id: int("id").autoincrement().primaryKey(),
  operatorId: int("operatorId").notNull(),
  credentialId: varchar("credentialId", { length: 36 }),
  handoffId: varchar("handoffId", { length: 36 }),
  type: mysqlEnum("type", ["arrival_scan", "handoff_completed", "credential_revoked", "invoice_issued", "invoice_status_changed"]).notNull(),
  locale: mysqlEnum("locale", ["es", "en"]),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("activity_operator_idx").on(table.operatorId)]);

export const operatorNotificationSettings = mysqlTable("operatorNotificationSettings", {
  operatorId: int("operatorId").primaryKey(),
  channel: mysqlEnum("channel", ["project_owner_push", "in_app_only"]).default("project_owner_push").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const operatorNotifications = mysqlTable("operatorNotifications", {
  id: int("id").autoincrement().primaryKey(),
  operatorId: int("operatorId").notNull(),
  credentialId: varchar("credentialId", { length: 36 }),
  handoffId: varchar("handoffId", { length: 36 }),
  type: mysqlEnum("type", ["arrival_scan", "handoff_completed", "invoice_issued"]).notNull(),
  titleEs: varchar("titleEs", { length: 240 }).notNull(),
  titleEn: varchar("titleEn", { length: 240 }).notNull(),
  detailEs: text("detailEs").notNull(),
  detailEn: text("detailEn").notNull(),
  deliveryChannel: mysqlEnum("deliveryChannel", ["project_owner_push", "in_app_only"]).notNull(),
  deliveryStatus: mysqlEnum("deliveryStatus", ["queued", "delivered", "unavailable"]).default("queued").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("notifications_operator_idx").on(table.operatorId)]);

export type Stay = typeof stays.$inferSelect;
export type Credential = typeof credentials.$inferSelect;
export type Handoff = typeof handoffs.$inferSelect;
export type OperatorNotification = typeof operatorNotifications.$inferSelect;
