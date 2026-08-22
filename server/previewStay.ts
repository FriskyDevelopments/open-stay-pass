import { issueCredentialToken } from "./credentialService";

export type PreviewStay = {
  credential: { id: string; operatorId: number; stayId: string; handoffId: null; type: "arrival"; status: "active"; expiresAt: Date };
  stay: {
    id: string;
    operatorId: number;
    propertyName: string;
    guestName: string;
    guestLocale: "es" | "en";
    wifiName: string;
    wifiPassword: string;
    houseRules: string;
    localRecommendations: string;
    arrivalAt: Date;
    departureAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };
};

const previews = new Map<string, PreviewStay>();

export function createPreviewStay() {
  if (process.env.NODE_ENV !== "development") return null;
  const id = `preview-${Date.now()}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const now = new Date();
  const token = issueCredentialToken({ credentialId: id, scope: "arrival", expiresAt: expiresAt.getTime() });
  previews.set(token, {
    credential: { id, operatorId: 0, stayId: id, handoffId: null, type: "arrival", status: "active", expiresAt },
    stay: {
      id,
      operatorId: 0,
      propertyName: "La Casa de Barra",
      guestName: "Frisky",
      guestLocale: "es",
      wifiName: "Casa-Barra",
      wifiPassword: "Bienvenido-2026",
      houseRules: "Silencio después de las 22:00; no fumar dentro.",
      localRecommendations: "Café cercano, estacionamiento y salida tardía bajo solicitud.",
      arrivalAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      departureAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: now,
      updatedAt: now,
    },
  });
  return token;
}

export function getPreviewStay(token: string) {
  if (process.env.NODE_ENV !== "development") return undefined;
  return previews.get(token);
}
