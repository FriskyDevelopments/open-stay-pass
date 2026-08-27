import React, { useState } from "react";
import { ArrowLeft, Download, ExternalLink, Github, Play, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const poster = "/manus-storage/folios-v2-campaign-poster_bce24ea5.png";
const repository = "https://github.com/FriskyDevelopments/open-stay-pass";

type PromoAsset = {
  title: string;
  format: string;
  duration: string;
  src: string;
  description: string;
  vertical?: boolean;
};

type PressEdition = {
  locale: "en" | "es";
  label: string;
  shortLabel: string;
  eyebrow: string;
  headline: React.ReactNode;
  intro: string;
  boundary: string;
  heroTitle: string;
  heroDescription: string;
  hero: string;
  assets: PromoAsset[];
  capabilities: readonly [string, string, string][];
  posterAlt: string;
  posterEyebrow: string;
  posterHeadline: React.ReactNode;
  posterDescription: string;
};

const editions: Record<"en" | "es", PressEdition> = {
  en: {
    locale: "en",
    label: "English dub",
    shortLabel: "ENGLISH",
    eyebrow: "PUBLIC PRESS KIT · FOLIOS COMPLIANCE V2 · ENGLISH DUB",
    headline: <>The proof carries arrival.<br /><em>The record carries the decision.</em></>,
    intro: "Launch assets for a QR-first hospitality credential system. Each asset keeps the same public boundary: carrier, signed resolver, preserved record, and explicit decision.",
    boundary: "QR and NFC remain proof carriers. Physical access belongs to the provider.",
    heroTitle: "One credential. A record that responds.",
    heroDescription: "The English dub keeps the Folios semantic system intact: Proof introduces the carrier, System describes review, Paper preserves evidence, and Signal appears only with a verified decision.",
    hero: "/manus-storage/folios-v2-open-stay-pass-hero-en-dub_bde2f60c.mp4",
    assets: [
      { title: "One signed link", format: "VERTICAL CUT A · 9:16", duration: "00:14", src: "/manus-storage/folios-v2-open-stay-pass-vertical-a-en-dub_20c9b391.mp4", description: "A short scan-or-tap story for Reels, Shorts, and TikTok: proof, resolver, and arrival record.", vertical: true },
      { title: "Provider boundary", format: "VERTICAL CUT B · 9:16", duration: "00:14", src: "/manus-storage/folios-v2-open-stay-pass-vertical-b-en-dub_048bae8a.mp4", description: "A technical boundary story: public credential carriers stay separate from external physical-access provisioning.", vertical: true },
    ],
    capabilities: [
      ["QR + NFC", "Verified carrier", "The same signed resolver; not a door key."],
      ["HostCasa", "Verified arrival rail", "Bilingual guide and grounded context."],
      ["Folios", "Verified record rail", "Evidence, lifecycle state, and next action."],
      ["Apple Wallet", "Apple-ready", "Issued-pass signing only with configured material."],
      ["Google Wallet", "Configuration required", "Not presented as an active issuance path."],
      ["Smart locks", "Provider-owned", "Provisioning, revocation, and audit remain external."],
    ],
    posterAlt: "Folios Compliance credential campaign visual with evidence record",
    posterEyebrow: "STATIC CAMPAIGN VISUAL · 4:5",
    posterHeadline: <>Evidence is not a feature.<br />It is the interface.</>,
    posterDescription: "For a launch post, a repository social preview, or a community thread. Do not attach fabricated adoption or issuance claims.",
  },
  es: {
    locale: "es",
    label: "Versión original en español",
    shortLabel: "ESPAÑOL",
    eyebrow: "KIT DE PRENSA PÚBLICO · FOLIOS COMPLIANCE V2 · VERSIÓN ORIGINAL",
    headline: <>El comprobante lleva la llegada.<br /><em>El registro lleva la decisión.</em></>,
    intro: "Activos de lanzamiento para un sistema de credenciales de hospitalidad QR-first. Cada activo conserva el mismo límite público: portador, resolver firmado, registro preservado y decisión explícita.",
    boundary: "QR y NFC siguen siendo portadores de comprobante. El acceso físico pertenece al proveedor.",
    heroTitle: "Una credencial. Un registro que responde.",
    heroDescription: "La versión original conserva los colores semánticos de Folios: Proof presenta el portador, System describe la revisión, Paper preserva la evidencia y Signal aparece solo ante una decisión verificada.",
    hero: "/manus-storage/folios-v2-open-stay-pass-hero_fb0d75ba.mp4",
    assets: [
      { title: "Un enlace firmado", format: "CORTE VERTICAL A · 9:16", duration: "00:14", src: "/manus-storage/folios-v2-open-stay-pass-vertical-a_ceb90185.mp4", description: "Una historia breve de escaneo o tap para Reels, Shorts y TikTok: comprobante, resolver y registro de llegada.", vertical: true },
      { title: "Límite del proveedor", format: "CORTE VERTICAL B · 9:16", duration: "00:14", src: "/manus-storage/folios-v2-open-stay-pass-vertical-b_5dfcedb3.mp4", description: "Una historia de límite técnico: los portadores públicos de credenciales permanecen separados de la provisión externa de acceso físico.", vertical: true },
    ],
    capabilities: [
      ["QR + NFC", "Portador verificado", "El mismo resolver firmado; no es una llave de puerta."],
      ["HostCasa", "Riel de llegada verificado", "Guía bilingüe y contexto fundamentado."],
      ["Folios", "Riel de registro verificado", "Evidencia, estado de ciclo y siguiente acción."],
      ["Apple Wallet", "Listo para Apple", "Firma de pase emitido solo con material configurado."],
      ["Google Wallet", "Requiere configuración", "No se muestra como una ruta de emisión activa."],
      ["Cerraduras inteligentes", "Propiedad del proveedor", "Provisionamiento, revocación y auditoría permanecen externos."],
    ],
    posterAlt: "Visual de campaña de credencial con evidencia de Folios Compliance",
    posterEyebrow: "VISUAL ESTÁTICO DE CAMPAÑA · 4:5",
    posterHeadline: <>La evidencia no es una función.<br />Es la interfaz.</>,
    posterDescription: "Para un post de lanzamiento, vista social del repositorio o hilo de comunidad. No adjuntes afirmaciones fabricadas de adopción o emisión.",
  },
};

export default function PressKit() {
  const [editionKey, setEditionKey] = useState<"en" | "es">("en");
  const edition = editions[editionKey];

  return (
    <main className="press-kit">
      <header className="press-nav">
        <Link href="/" className="press-back"><ArrowLeft size={15} /> Open Stay Pass</Link>
        <div className="press-nav-actions">
          <div className="press-edition-switch" role="group" aria-label="Campaign language edition">
            {(Object.keys(editions) as ("en" | "es")[]).map((locale) => (
              <button key={locale} type="button" className={editionKey === locale ? "active" : ""} onClick={() => setEditionKey(locale)} aria-pressed={editionKey === locale}>
                {editions[locale].shortLabel}
              </button>
            ))}
          </div>
          <a href={repository} target="_blank" rel="noreferrer" className="press-repo"><Github size={15} /> {editionKey === "en" ? "Star on GitHub" : "Dale Star en GitHub"} <ExternalLink size={13} /></a>
        </div>
      </header>
      <section className="press-hero">
        <p className="eyebrow aqua">{edition.eyebrow}</p>
        <h1>{edition.headline}</h1>
        <p>{edition.intro}</p>
        <div className="press-boundary"><ShieldCheck size={16} /><span>{edition.boundary}</span></div>
      </section>
      <section className="press-feature">
        <div className="press-feature-media">
          <video controls preload="metadata" poster={poster} aria-label={`${edition.label} Open Stay Pass hero video`}>
            <source src={edition.hero} type="video/mp4" />
          </video>
        </div>
        <div className="press-feature-copy">
          <span>00:30 · {editionKey === "en" ? "ENGLISH DUB · HERO FILM 16:9" : "VIDEO PRINCIPAL ORIGINAL · 16:9"}</span>
          <h2>{edition.heroTitle}</h2>
          <p>{edition.heroDescription}</p>
          <a href={edition.hero} download><Download size={15} /> {editionKey === "en" ? "Download English MP4" : "Descargar MP4 en español"}</a>
        </div>
      </section>
      <section className="press-assets" aria-label={editionKey === "en" ? "Campaign assets" : "Activos de campaña"}>
        {edition.assets.map((asset) => (
          <article className="press-asset" key={asset.title}>
            <div className={`press-asset-media ${asset.vertical ? "is-vertical" : ""}`}>
              <video controls preload="metadata" poster={poster} aria-label={`${edition.label}: ${asset.title}`}>
                <source src={asset.src} type="video/mp4" />
              </video>
            </div>
            <div className="press-asset-copy">
              <span>{asset.format} · {asset.duration}</span>
              <h2>{asset.title}</h2>
              <p>{asset.description}</p>
              <a href={asset.src} download><Play size={14} /> {editionKey === "en" ? "Download MP4" : "Descargar MP4"}</a>
            </div>
          </article>
        ))}
      </section>
      <section className="press-capabilities" aria-label={editionKey === "en" ? "Verified capability boundaries" : "Límites de capacidad verificados"}>
        <div><p className="eyebrow aqua">{editionKey === "en" ? "CAPABILITY BOUNDARY · REVIEW BEFORE EXTERNAL USE" : "LÍMITE DE CAPACIDAD · REVISA ANTES DE USO EXTERNO"}</p><h2>{editionKey === "en" ? "Every surface has a stated boundary." : "Cada superficie tiene un límite declarado."}</h2></div>
        <div className="press-capability-table">
          {edition.capabilities.map(([surface, status, boundary]) => <article key={surface}><span>{surface}</span><b>{status}</b><p>{boundary}</p></article>)}
        </div>
      </section>
      <section className="press-poster">
        <img src={poster} alt={edition.posterAlt} />
        <div>
          <p className="eyebrow">{edition.posterEyebrow}</p>
          <h2>{edition.posterHeadline}</h2>
          <p>{edition.posterDescription}</p>
          <a href={poster} download><Download size={15} /> {editionKey === "en" ? "Download PNG poster" : "Descargar poster PNG"}</a>
        </div>
      </section>
    </main>
  );
}
