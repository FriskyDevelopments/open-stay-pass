import { createServer } from "node:http";
import { continuityRails } from "./continuity.js";

export const DEMO_ENDPOINTS = [
  "/api/demo/qr.svg",
  "/api/demo/continuity/hostcasa",
  "/api/demo/continuity/folios",
] as const;

export function createDemoServer() {
  return createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (url.pathname === "/api/demo/qr.svg") {
      response.writeHead(200, { "content-type": "image/svg+xml" });
      response.end('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#F2F0E9"/><text x="20" y="85" fill="#102526" font-size="14">SIGNED QR</text></svg>');
      return;
    }
    const product = url.pathname.endsWith("/hostcasa") ? "hostcasa" : url.pathname.endsWith("/folios") ? "folios" : null;
    if (product) {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(continuityRails.find((rail) => rail.product === product)));
      return;
    }
    response.writeHead(404).end();
  });
}
