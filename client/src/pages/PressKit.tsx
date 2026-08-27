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
    title: "Proof → Resolver → Record → Decision",
    format: "HERO FILM · 16:9",
    duration: "00:30",
    src: hero,
    subtitles: heroSubs,
    description: "Spanish narration with English subtitles. Shows the real credential lifecycle without implying physical access or unsupported Wallet issuance.",
  },
  {
    title: "One signed link",
    format: "VERTICAL CUT A · 9:16",
    duration: "00:14",
    src: verticalA,
    subtitles: verticalASubs,
    description: "A concise scan-or-tap story for Reels, Shorts, and TikTok: proof carrier, resolver, and arrival record.",
    vertical: true,
  },
  {
    title: "Provider boundary",
    format: "VERTICAL CUT B · 9:16",
    duration: "00:14",
    src: verticalB,
    subtitles: verticalBSubs,
    description: "A technical boundary story: public credential carriers remain separate from external physical-access provisioning.",
    vertical: true,
  },
];

export default function PressKit() {
  return (
    <main className="press-kit">
      <header className="press-nav">
        <Link href="/" className="press-back"><ArrowLeft size={15} /> Open Stay Pass</Link>
        <a href={repository} target="_blank" rel="noreferrer" className="press-repo"><Github size={15} /> Star on GitHub <ExternalLink size={13} /></a>
      </header>
      <section className="press-hero">
        <p className="eyebrow aqua">PUBLIC PRESS KIT · FOLIOS COMPLIANCE V2</p>
        <h1>Proof carries the arrival.<br /><em>Record carries the decision.</em></h1>
        <p>Launch assets for a QR-first hospitality credential system. Every asset preserves the same public boundary: carrier, signed resolver, preserved record, explicit decision.</p>
        <div className="press-boundary"><ShieldCheck size={16} /><span>QR / NFC remain proof carriers. Physical access remains provider-owned.</span></div>
      </section>
      <section className="press-feature">
        <div className="press-feature-media">
          <video controls preload="metadata" poster={poster} aria-label="Open Stay Pass hero film">
            <source src={hero} type="video/mp4" />
            <track kind="subtitles" srcLang="en" label="English" src={heroSubs} default />
          </video>
        </div>
        <div className="press-feature-copy">
          <span>00:30 · 16:9 HERO FILM</span>
          <h2>One credential, continuously accountable.</h2>
          <p>Designed around Folios semantic colors: Proof introduces the carrier, System describes review, Paper preserves evidence, and Signal appears only at a verified decision.</p>
          <a href={hero} download><Download size={15} /> Download hero MP4</a>
        </div>
      </section>
      <section className="press-assets" aria-label="Campaign assets">
        {assets.slice(1).map((asset) => (
          <article className="press-asset" key={asset.title}>
            <div className={`press-asset-media ${asset.vertical ? "is-vertical" : ""}`}>
              <video controls preload="metadata" poster={poster} aria-label={asset.title}>
                <source src={asset.src} type="video/mp4" />
                <track kind="subtitles" srcLang="en" label="English" src={asset.subtitles} default />
              </video>
            </div>
            <div className="press-asset-copy">
              <span>{asset.format} · {asset.duration}</span>
              <h2>{asset.title}</h2>
              <p>{asset.description}</p>
              <a href={asset.src} download><Play size={14} /> Download MP4</a>
            </div>
          </article>
        ))}
      </section>
      <section className="press-poster">
        <img src={poster} alt="Folios Compliance evidence credential campaign visual" />
        <div>
          <p className="eyebrow">STATIC CAMPAIGN VISUAL · 4:5</p>
          <h2>Evidence is not a feature.<br />It is the interface.</h2>
          <p>For a launch post, repository social preview, or community thread. Do not attach fabricated adoption or issuance claims.</p>
          <a href={poster} download><Download size={15} /> Download poster PNG</a>
        </div>
      </section>
    </main>
  );
}
