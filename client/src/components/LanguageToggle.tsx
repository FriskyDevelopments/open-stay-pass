import type { Locale } from "@/lib/locale";

export function LanguageToggle({ locale, onChange, contrast = "dark" }: { locale: Locale; onChange: (locale: Locale) => void; contrast?: "dark" | "light" }) {
  return (
    <div className={`language-toggle ${contrast === "light" ? "language-toggle-light" : ""}`} aria-label="Language selector">
      <button type="button" className={locale === "en" ? "active" : ""} onClick={() => onChange("en")}>EN</button>
      <span>/</span>
      <button type="button" className={locale === "es" ? "active" : ""} onClick={() => onChange("es")}>ES</button>
    </div>
  );
}
