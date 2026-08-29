import type { Express } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const rawKey = (req.params as Record<string, string>)[0];
    let key: string;
    try {
      key = decodeURIComponent(rawKey ?? "");
    } catch {
      res.status(400).send("Invalid storage key");
      return;
    }
    const isValidKey = Boolean(key)
      && !key.startsWith("/")
      && !key.includes("\\")
      && !key.split("/").includes("..")
      && /^[a-zA-Z0-9/_\-.]+$/.test(key)
      && ENV.storagePublicPrefixes.some(prefix => key.startsWith(prefix));
    if (!isValidKey) {
      res.status(404).send("Storage object not found");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey || ENV.storagePublicPrefixes.length === 0) {
      res.status(404).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
