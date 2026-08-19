export type Locale = "es" | "en";

export const copy = <T,>(locale: Locale, spanish: T, english: T) => (locale === "es" ? spanish : english);

export const formatDate = (value: Date | string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
