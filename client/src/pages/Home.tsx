import { LanguageToggle } from "@/components/LanguageToggle";
import { copy, type Locale } from "@/lib/locale";
import { KeyRound, ScanLine, Workflow } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("es");
  return (
    <main className="landing">
      <header className="public-nav">
        <div className="brand-combo">HOSTCASA <span>×</span> FOLIOS</div>
        <div className="nav-right"><Link href="/integrations">{copy(locale, "Integraciones", "Integrations")}</Link><LanguageToggle locale={locale} onChange={setLocale} /></div>
      </header>
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow aqua">OPEN STAY PASS · QR-FIRST</p>
          <h1>{copy(locale, "Una llegada segura. Un", "One secure arrival. One")} <strong>{copy(locale, "siguiente paso", "next move")}</strong>.</h1>
          <p>{copy(locale, "HostCasa convierte un QR en una guía de llegada bella y verificada. Folios convierte una nota, foto o enlace en un handoff claro. Un solo núcleo de credenciales; dos experiencias con propósito.", "HostCasa turns a QR into a beautiful, verified arrival guide. Folios turns a note, photo, or link into a clear handoff. One credential core; two purposeful experiences.")}</p>
          <div className="hero-actions"><Link href="/operator"><KeyRound size={16} /> {copy(locale, "Crear una credencial", "Create a credential")}</Link><Link href="/integrations" className="secondary"><Workflow size={16} /> {copy(locale, "Ver integraciones", "View integrations")}</Link></div>
        </div>
        <div className="credential-orbit"><div className="credential-core"><div className="mini-row"><ScanLine size={15} /> VERIFIED PASS</div><h2>La Casa<br/>de Barra</h2><p>{copy(locale, "Guía de llegada lista", "Arrival guide ready")}</p><div className="credential-code" /></div></div>
      </section>
      <section className="product-rail">
        <article className="product-panel host"><p className="eyebrow aqua">HOSTCASA · GUEST ARRIVAL</p><h2>{copy(locale, "Hospitalidad que comienza con un scan", "Hospitality that begins with a scan")}</h2><p>{copy(locale, "QR primero. Wallet, NFC y ConciergeAI como mejoras progresivas, no requisitos.", "QR first. Wallet, NFC, and ConciergeAI as progressive upgrades, not prerequisites.")}</p><ul><li>{copy(locale, "Guía móvil bilingüe", "Bilingual mobile guide")}</li><li>{copy(locale, "Token firmado y revocable", "Signed, revocable token")}</li><li>{copy(locale, "Respuestas aprobadas por operador", "Operator-approved answers")}</li></ul></article>
        <article className="product-panel folios"><p className="eyebrow emerald">FOLIOS · PROOF HANDOFF</p><h2>{copy(locale, "Una cosa clara. Un siguiente movimiento.", "One clear thing. One next move.")}</h2><p>{copy(locale, "Cinco pasos ligeros para operadores pequeños: capturar, dar contexto, revisar, elegir responsable y compartir.", "Five lightweight steps for small operators: capture, add context, check, choose an owner, and share.")}</p><ul><li>{copy(locale, "Sin workspace pesado", "No heavyweight workspace")}</li><li>{copy(locale, "Prueba visible", "Visible proof")}</li><li>{copy(locale, "Link seguro para completar", "Secure completion link")}</li></ul></article>
      </section>
      <footer className="landing-footer"><span>HOSTCASA · Hospitality, Elevated.</span><span>FOLIOS · ONE RECORD</span><span>QR · WALLET · NFC · AI</span></footer>
    </main>
  );
}
