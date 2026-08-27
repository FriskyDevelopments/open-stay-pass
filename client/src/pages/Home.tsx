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
        <div className="nav-right"><Link href="/press-kit">{copy(locale, "Press kit", "Press kit")}</Link><Link href="/integrations">{copy(locale, "Integraciones", "Integrations")}</Link><LanguageToggle locale={locale} onChange={setLocale} /></div>
      </header>
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow aqua">OPEN STAY PASS · SIGNED CREDENTIAL</p>
          <h1>{copy(locale, "Una credencial. Un", "One credential. One")} <strong>{copy(locale, "registro continuo", "continuous record")}</strong>.</h1>
          <p>{copy(locale, "Un carrier de prueba abre un resolver firmado. HostCasa conserva la llegada; Folios preserva evidencia, estado y siguiente acción. La decisión siempre se verifica en servidor.", "A proof carrier opens a signed resolver. HostCasa preserves arrival; Folios preserves evidence, state, and next action. The decision is always verified server-side.")}</p>
          <div className="hero-actions"><Link href="/operator"><KeyRound size={16} /> {copy(locale, "Crear una credencial", "Create a credential")}</Link><Link href="/integrations" className="secondary"><Workflow size={16} /> {copy(locale, "Ver integraciones", "View integrations")}</Link>{repositoryUrl ? <a className="star-repo-button" href={repositoryUrl} target="_blank" rel="noreferrer"><Github size={16} /><span>{copy(locale, "Star en GitHub", "Star on GitHub")}</span><Star className="star-repo-icon" size={15} /></a> : <span className="star-repo-button star-repo-pending" title={copy(locale, "El enlace público aparecerá al exportar el repositorio", "The public link appears after repository export")}><Github size={16} /><span>{copy(locale, "Star: repositorio en preparación", "Star: repository preparing")}</span><Star className="star-repo-icon" size={15} /></span>}</div>
        </div>
        <div className="credential-orbit"><div className="credential-core"><div className="mini-row"><ScanLine size={15} /> PROOF CARRIER</div><h2>La Casa<br/>de Barra</h2><p>{copy(locale, "Fuente · llegada · estado", "Source · arrival · state")}</p><div className="credential-meta"><span>RESOLVER / ACTIVE</span><b>ISSUED</b></div><div className="credential-code" /></div></div>
      </section>
      <section className="credential-sequence" aria-label={copy(locale, "Secuencia de credencial", "Credential sequence")}>
        <div><span>01</span><b>{copy(locale, "PRUEBA", "PROOF")}</b><small>{copy(locale, "QR / NFC", "QR / NFC")}</small></div>
        <i aria-hidden="true" />
        <div><span>02</span><b>{copy(locale, "RESOLVER", "RESOLVER")}</b><small>{copy(locale, "FIRMA + REVOCACIÓN", "SIGNATURE + REVOCATION")}</small></div>
        <i aria-hidden="true" />
        <div><span>03</span><b>{copy(locale, "REGISTRO", "RECORD")}</b><small>{copy(locale, "HOSTCASA / FOLIOS", "HOSTCASA / FOLIOS")}</small></div>
        <i aria-hidden="true" />
        <div className="decision"><span>04</span><b>{copy(locale, "DECISIÓN", "DECISION")}</b><small>{copy(locale, "VERIFICADA", "VERIFIED")}</small></div>
      </section>
      <section className="product-rail">
        <article className="product-panel host"><div className="pass-rail"><span>01 · SCAN / TAP / OPEN</span><i aria-hidden="true" /></div><p className="eyebrow aqua">HOSTCASA · GUEST ARRIVAL</p><h2>{copy(locale, "Hospitalidad que comienza con un scan", "Hospitality that begins with a scan")}</h2><p>{copy(locale, "QR primero. Wallet, NFC y ConciergeAI como mejoras progresivas, no requisitos.", "QR first. Wallet, NFC, and ConciergeAI as progressive upgrades, not prerequisites.")}</p><ul><li>{copy(locale, "Guía móvil bilingüe", "Bilingual mobile guide")}</li><li>{copy(locale, "Token firmado y revocable", "Signed, revocable token")}</li><li>{copy(locale, "Respuestas aprobadas por operador", "Operator-approved answers")}</li></ul><footer>{copy(locale, "CREDENCIAL · FIRMA · REVOCACIÓN", "CREDENTIAL · SIGNATURE · REVOCATION")}</footer></article>
        <article className="product-panel folios"><div className="pass-rail"><span>02 · CAPTURE / VERIFY / HANDOFF</span><i aria-hidden="true" /></div><p className="eyebrow emerald">FOLIOS · PROOF HANDOFF</p><h2>{copy(locale, "Una cosa clara. Un siguiente movimiento.", "One clear thing. One next move.")}</h2><p>{copy(locale, "Cinco pasos ligeros para operadores pequeños: capturar, dar contexto, revisar, elegir responsable y compartir.", "Five lightweight steps for small operators: capture, add context, check, choose an owner, and share.")}</p><ul><li>{copy(locale, "Sin workspace pesado", "No heavyweight workspace")}</li><li>{copy(locale, "Prueba visible", "Visible proof")}</li><li>{copy(locale, "Link seguro para completar", "Secure completion link")}</li></ul><footer>{copy(locale, "EVIDENCIA · PROPIETARIO · SIGUIENTE PASO", "EVIDENCE · OWNER · NEXT STEP")}</footer></article>
      </section>
      <footer className="landing-footer"><span>HOSTCASA · Hospitality, Elevated.</span><span>FOLIOS · ONE RECORD</span><span>QR · WALLET · NFC · AI</span>{repositoryUrl ? <a className="support-link" href={repositoryUrl} target="_blank" rel="noreferrer"><Github size={14} /> {copy(locale, "Da una Star al repositorio", "Star the repository")}</a> : null}{supportLinks.length ? <span className="support-links"><Heart size={14} /> {copy(locale, "Apoya el núcleo abierto", "Support the open core")}{supportLinks.map(link => <a key={link.id} href={link.href} target="_blank" rel="noreferrer">{link.label[locale]}</a>)}</span> : null}</footer>
    </main>
  );
}
