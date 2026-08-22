import { describe, expect, it } from "vitest";
import { instantAmenityAnswer } from "./amenityAnswers";

describe("instantAmenityAnswer", () => {
  const context = { wifiName: "Casa-Barra", wifiPassword: "mar-azul", houseRules: "Quiet after 10pm.", localRecommendations: "Café Nativo and the north beach." };

  it("returns a localized Wi-Fi answer from approved content without invoking a model", () => {
    expect(instantAmenityAnswer("¿Cuál es la contraseña del Wi-Fi?", "es", context)).toContain("mar-azul");
    expect(instantAmenityAnswer("What is the Wi-Fi password?", "en", context)).toContain("Casa-Barra");
  });

  it("returns approved rules and local recommendations for amenity-specific questions", () => {
    expect(instantAmenityAnswer("Can I smoke inside?", "en", context)).toContain("Quiet after 10pm.");
    expect(instantAmenityAnswer("¿Qué hay cerca para comer?", "es", context)).toContain("Café Nativo");
  });
});
