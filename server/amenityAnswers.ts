import type { Locale } from "../shared/openStay";

type AmenityContext = {
  wifiName?: string | null;
  wifiPassword?: string | null;
  houseRules?: string | null;
  localRecommendations?: string | null;
};

function answer(locale: Locale, spanish: string, english: string) {
  return locale === "es" ? spanish : english;
}

export function instantAmenityAnswer(question: string, locale: Locale, context: AmenityContext) {
  const normalized = question.toLocaleLowerCase();
  if (/(wifi|wi-fi|internet|contraseña|password)/.test(normalized)) {
    if (!context.wifiName) return answer(locale, "No puedo confirmar el Wi‑Fi porque el anfitrión todavía no lo agregó a esta guía. Contacta al operador.", "I cannot confirm the Wi‑Fi because the host has not added it to this guide yet. Please contact the operator.");
    const password = context.wifiPassword ? answer(locale, ` La contraseña es ${context.wifiPassword}.`, ` The password is ${context.wifiPassword}.`) : answer(locale, " La contraseña se compartirá al llegar.", " The password will be shared on arrival.");
    return answer(locale, `El Wi‑Fi aprobado para esta estancia es ${context.wifiName}.${password}`, `The approved Wi‑Fi for this stay is ${context.wifiName}.${password}`);
  }
  if (/(regla|rules|fumar|smok|silencio|quiet|mascota|pet)/.test(normalized)) {
    return context.houseRules ? answer(locale, `Las reglas aprobadas por el anfitrión son: ${context.houseRules}`, `The host-approved house rules are: ${context.houseRules}`) : answer(locale, "El anfitrión todavía no agregó reglas a esta guía. Contacta al operador para confirmarlas.", "The host has not added rules to this guide yet. Please contact the operator to confirm them.");
  }
  if (/(cerca|near|recomend|recommend|café|cafe|comer|eat|parking|estacion)/.test(normalized)) {
    return context.localRecommendations ? answer(locale, `Las recomendaciones aprobadas cerca de la propiedad son: ${context.localRecommendations}`, `The approved recommendations near the property are: ${context.localRecommendations}`) : answer(locale, "El anfitrión todavía no agregó recomendaciones locales a esta guía.", "The host has not added local recommendations to this guide yet.");
  }
  return null;
}
