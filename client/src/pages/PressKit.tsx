import { ArrowLeft, Download, ExternalLink, Github, Play, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const hero = "/manus-storage/folios-v2-open-stay-pass-hero_fb0d75ba.mp4";
const verticalA = "/manus-storage/folios-v2-open-stay-pass-vertical-a_ceb90185.mp4";
const verticalB = "/manus-storage/folios-v2-open-stay-pass-vertical-b_5dfcedb3.mp4";
const poster = "/manus-storage/folios-v2-campaign-poster_bce24ea5.png";
const heroSubs = "/manus-storage/folios-v2-open-stay-pass-hero.en_3a4f7783.srt";
const verticalASubs = "/manus-storage/folios-v2-open-stay-pass-vertical-a.en_ccf45672.srt";
const verticalBSubs = "/manus-storage/folios-v2-open-stay-pass-vertical-b.en_a1b7c6be.srt";
const repository = "https://github.com/FriskyDevelopments/open-stay-pass";

type PromoAsset = {
  title: string;
  format: string;
  duration: string;
  src: string;
  subtitles: string;
  description: string;
  vertical?: boolean;
};

const assets: PromoAsset[] = [
  {
    title: "Comprobante → Resolver → Registro → Decisión",
    format: "HERO FILM · 16:9",
    duration: "00:30",
    src: hero,
    subtitles: heroSubs,
    description: "Narración en español con subtítulos en inglés. Muestra el ciclo real de la credencial sin implicar acceso físico ni emisión Wallet no disponible.",
  },
  {
    title: "Un enlace firmado",
    format: "VERTICAL CUT A · 9:16",
    duration: "00:14",
    src: verticalA,
    subtitles: verticalASubs,
    description: "Una historia breve de escaneo o tap para Reels, Shorts y TikTok: comprobante, resolver y registro de llegada.",
    vertical: true,
  },
  {
    title: "Límite del proveedor",
    format: "VERTICAL CUT B · 9:16",
    duration: "00:14",
    src: verticalB,
    subtitles: verticalBSubs,
    description: "Una historia de límite técnico: los portadores públicos de credenciales permanecen separados de la provisión externa de acceso físico.",
    vertical: true,
  },
];

const capabilityRows = [
  ["QR + NFC", "Portador verificado", "El mismo resolver firmado; no es una llave de puerta."],
  ["HostCasa", "Riel de llegada verificado", "Guía bilingüe y contexto fundamentado."],
  ["Folios", "Riel de registro verificado", "Evidencia, estado de ciclo y siguiente acción."],
  ["Apple Wallet", "Listo para Apple", "Firma de pase emitido solo con material configurado."],
  ["Google Wallet", "Requiere configuración", "No se muestra como una ruta de emisión activa."],
  ["Cerraduras inteligentes", "Propiedad del proveedor", "Provisionamiento, revocación y auditoría permanecen externos."],
];

export default function PressKit() {
  return (
    <main className="press-kit">
      <header className="press-nav">
        <Link href="/" className="press-back"><ArrowLeft size={15} /> Open Stay Pass</Link>
        <a href={repository} target="_blank" rel="noreferrer" className="press-repo"><Github size={15} /> Dale Star en GitHub <ExternalLink size={13} /></a>
      </header>
      <section className="press-hero">
        <p className="eyebrow aqua">KIT DE PRENSA PÚBLICO · FOLIOS COMPLIANCE V2</p>
        <h1>El comprobante lleva la llegada.<br /><em>El registro lleva la decisión.</em></h1>
        <p>Activos de lanzamiento para un sistema de credenciales de hospitalidad QR-first. Cada activo conserva el mismo límite público: portador, resolver firmado, registro preservado y decisión explícita.</p>
        <div className="press-boundary"><ShieldCheck size={16} /><span>QR / NFC siguen siendo portadores de comprobante. El acceso físico pertenece al proveedor.</span></div>
      </section>
      <section className="press-feature">
        <div className="press-feature-media">
          <video controls preload="metadata" poster={poster} aria-label="Video principal de Open Stay Pass">
            <source src={hero} type="video/mp4" />
            <track kind="subtitles" srcLang="en" label="English subtitles" src={heroSubs} default />
          </video>
        </div>
        <div className="press-feature-copy">
          <span>00:30 · VIDEO PRINCIPAL 16:9</span>
          <h2>Una credencial. Un registro que responde.</h2>
          <p>Diseñado con los colores semánticos de Folios: Proof presenta el portador, System describe la revisión, Paper preserva la evidencia y Signal aparece solo ante una decisión verificada.</p>
          <a href={hero} download><Download size={15} /> Descargar MP4 principal</a>
        </div>
      </section>
      <section className="press-assets" aria-label="Activos de campaña">
        {assets.slice(1).map((asset) => (
          <article className="press-asset" key={asset.title}>
            <div className={`press-asset-media ${asset.vertical ? "is-vertical" : ""}`}>
              <video controls preload="metadata" poster={poster} aria-label={asset.title}>
                <source src={asset.src} type="video/mp4" />
                <track kind="subtitles" srcLang="en" label="English subtitles" src={asset.subtitles} default />
              </video>
            </div>
            <div className="press-asset-copy">
              <span>{asset.format} · {asset.duration}</span>
              <h2>{asset.title}</h2>
              <p>{asset.description}</p>
              <a href={asset.src} download><Play size={14} /> Descargar MP4</a>
            </div>
          </article>
        ))}
      </section>
      <section className="press-capabilities" aria-label="Límites de capacidad verificados">
        <div><p className="eyebrow aqua">LÍMITE DE CAPACIDAD · REVISA ANTES DE USO EXTERNO</p><h2>Cada superficie tiene un límite declarado.</h2></div>
        <div className="press-capability-table">
          {capabilityRows.map(([surface, status, boundary]) => <article key={surface}><span>{surface}</span><b>{status}</b><p>{boundary}</p></article>)}
        </div>
      </section>
      <section className="press-poster">
        <img src={poster} alt="Visual de campaña de credencial con evidencia de Folios Compliance" />
        <div>
          <p className="eyebrow">VISUAL ESTÁTICO DE CAMPAÑA · 4:5</p>
          <h2>La evidencia no es una función.<br />Es la interfaz.</h2>
          <p>Para un post de lanzamiento, vista social del repositorio o hilo de comunidad. No adjuntes afirmaciones fabricadas de adopción o emisión.</p>
          <a href={poster} download><Download size={15} /> Descargar poster PNG</a>
        </div>
      </section>
    </main>
  );
}
