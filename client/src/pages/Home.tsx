import { LanguageToggle } from "@/components/LanguageToggle";
import { copy, type Locale } from "@/lib/locale";
import { Github, Heart, KeyRound, ScanLine, Star, Workflow } from "lucide-react";
import { getGitHubRepositoryUrl, getSupportLinks } from "@/lib/community";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("es");
  const supportLinks = getSupportLinks();
  const repositoryUrl = getGitHubRepositoryUrl();
  return (
    <main className="landing">
      <header className="public-nav">
        <div className="brand-combo"><i aria-hidden="true">H×F</i><span>HOSTCASA</span><b>×</b><span>FOLIOS</span></div>
        <div className="nav-right"><Link href="/integrations">{copy(locale, "Integraciones", "Integrations")}</Link><LanguageToggle locale={locale} onChange={setLocale} /></div>
      </header>
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow aqua">OPEN STAY PASS · QR-FIRST</p>
          <h1>{copy(locale, "Una llegada segura. Un", "One secure arrival. One")} <strong>{copy(locale, "siguiente paso", "next move")}</strong>.</h1>
          <p>{copy(locale, "HostCasa convierte un QR en una guía de llegada bella y verificada. Folios convierte una nota, foto o enlace en un handoff claro. Un solo núcleo de credenciales; dos experiencias con propósito.", "HostCasa turns a QR into a beautiful, verified arrival guide. Folios turns a note, photo, or link into a clear handoff. One credential core; two purposeful experiences.")}</p>
          <div className="hero-actions"><Link href="/operator"><KeyRound size={16} /> {copy(locale, "Crear una credencial", "Create a credential")}</Link><Link href="/integrations" className="secondary"><Workflow size={16} /> {copy(locale, "Ver integraciones", "View integrations")}</Link>{repositoryUrl ? <a className="star-repo-button" href={repositoryUrl} target="_blank" rel="noreferrer"><Github size={16} /><span>{copy(locale, "Star en GitHub", "Star on GitHub")}</span><Star className="star-repo-icon" size={15} /></a> : <span className="star-repo-button star-repo-pending" title={copy(locale, "El enlace público aparecerá al exportar el repositorio", "The public link appears after repository export")}><Github size={16} /><span>{copy(locale, "Star: repositorio en preparación", "Star: repository preparing")}</span><Star className="star-repo-icon" size={15} /></span>}</div>
        </div>
        <div className="credential-orbit"><div className="credential-core"><div className="mini-row"><ScanLine size={15} /> VERIFIED PASS</div><h2>La Casa<br/>de Barra</h2><p>{copy(locale, "Guía de llegada lista", "Arrival guide ready")}</p><div className="credential-code" /></div></div>
      </section>
      <section className="product-rail">
        <article className="product-panel host"><div className="pass-rail"><span>01 · SCAN / TAP / OPEN</span><i aria-hidden="true" /></div><p className="eyebrow aqua">HOSTCASA · GUEST ARRIVAL</p><h2>{copy(locale, "Hospitalidad que comienza con un scan", "Hospitality that begins with a scan")}</h2><p>{copy(locale, "QR primero. Wallet, NFC y ConciergeAI como mejoras progresivas, no requisitos.", "QR first. Wallet, NFC, and ConciergeAI as progressive upgrades, not prerequisites.")}</p><ul><li>{copy(locale, "Guía móvil bilingüe", "Bilingual mobile guide")}</li><li>{copy(locale, "Token firmado y revocable", "Signed, revocable token")}</li><li>{copy(locale, "Respuestas aprobadas por operador", "Operator-approved answers")}</li></ul><footer>{copy(locale, "CREDENCIAL · FIRMA · REVOCACIÓN", "CREDENTIAL · SIGNATURE · REVOCATION")}</footer></article>
        <article className="product-panel folios"><div className="pass-rail"><span>02 · CAPTURE / VERIFY / HANDOFF</span><i aria-hidden="true" /></div><p className="eyebrow emerald">FOLIOS · PROOF HANDOFF</p><h2>{copy(locale, "Una cosa clara. Un siguiente movimiento.", "One clear thing. One next move.")}</h2><p>{copy(locale, "Cinco pasos ligeros para operadores pequeños: capturar, dar contexto, revisar, elegir responsable y compartir.", "Five lightweight steps for small operators: capture, add context, check, choose an owner, and share.")}</p><ul><li>{copy(locale, "Sin workspace pesado", "No heavyweight workspace")}</li><li>{copy(locale, "Prueba visible", "Visible proof")}</li><li>{copy(locale, "Link seguro para completar", "Secure completion link")}</li></ul><footer>{copy(locale, "EVIDENCIA · PROPIETARIO · SIGUIENTE PASO", "EVIDENCE · OWNER · NEXT STEP")}</footer></article>
      </section>
      <footer className="landing-footer"><span>HOSTCASA · Hospitality, Elevated.</span><span>FOLIOS · ONE RECORD</span><span>QR · WALLET · NFC · AI</span>{repositoryUrl ? <a className="support-link" href={repositoryUrl} target="_blank" rel="noreferrer"><Github size={14} /> {copy(locale, "Da una Star al repositorio", "Star the repository")}</a> : null}{supportLinks.length ? <span className="support-links"><Heart size={14} /> {copy(locale, "Apoya el núcleo abierto", "Support the open core")}{supportLinks.map(link => <a key={link.id} href={link.href} target="_blank" rel="noreferrer">{link.label[locale]}</a>)}</span> : null}</footer>
    </main>
  );
}
