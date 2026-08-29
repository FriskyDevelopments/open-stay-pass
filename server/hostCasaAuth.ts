import { createClient } from "@supabase/supabase-js";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, SESSION_MAX_AGE_MS } from "@shared/const";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";

function getPublicConfig() {
  const url = process.env.VITE_HOSTCASA_SUPABASE_URL?.trim();
  const anonKey = process.env.VITE_HOSTCASA_SUPABASE_ANON_KEY?.trim();
  return url && anonKey ? { url, anonKey } : null;
}

function getAccessToken(req: Request) {
  const value = req.body?.accessToken;
  return typeof value === "string" && value.length > 20 ? value : null;
}

export function registerHostCasaAuthRoutes(app: Express) {
  app.post("/api/auth/hostcasa/session", async (req: Request, res: Response) => {
    const config = getPublicConfig();
    if (!config) {
      res.status(503).json({ error: "HostCasa shared login is not configured" });
      return;
    }

    const accessToken = getAccessToken(req);
    if (!accessToken) {
      res.status(400).json({ error: "A Supabase access token is required" });
      return;
    }

    try {
      const supabase = createClient(config.url, config.anonKey, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      });
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error || !data.user) {
        res.status(401).json({ error: "Invalid HostCasa identity" });
        return;
      }

      const hostcasaId = data.user.id;
      const openId = `hostcasa:${hostcasaId}`;
      const name = String(data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? data.user.email ?? "HostCasa operator");
      const provider = String(data.user.app_metadata?.provider ?? "hostcasa");

      await db.upsertUser({
        openId,
        hostcasaId,
        name,
        email: data.user.email ?? null,
        loginMethod: `hostcasa_${provider}`,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, { name, expiresInMs: SESSION_MAX_AGE_MS });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: SESSION_MAX_AGE_MS });
      res.json({ ok: true });
    } catch (error) {
      console.error("[HostCasa Auth] Session bridge failed", error);
      res.status(500).json({ error: "HostCasa shared login failed" });
    }
  });
}
