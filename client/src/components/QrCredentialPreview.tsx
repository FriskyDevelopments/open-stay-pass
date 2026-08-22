import { copy, type Locale } from "@/lib/locale";
import { Check, Clipboard, Loader2, Maximize2, Nfc, QrCode, X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  locale: Locale;
  isLoading?: boolean;
  qrDataUrl?: string;
  link?: string;
  nfcUri?: string | null;
  copied: string;
  label: "arrival" | "handoff" | "stored";
  onCopy: (value: string, label: string) => void;
};

export default function QrCredentialPreview({ locale, isLoading, qrDataUrl, link, nfcUri, copied, label, onCopy }: Props) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  if (!isLoading && (!qrDataUrl || !link)) return null;
  const heading = label === "handoff" ? copy(locale, "Handoff seguro listo", "Secure handoff ready") : copy(locale, "Tu credencial está lista", "Your credential is ready");
  return <section className="qr-credential-preview" aria-live="polite">
    {isLoading ? <div className="qr-loading"><span className="qr-loading-grid"><Loader2 className="spin" /></span><div><p className="eyebrow aqua">OPEN STAY PASS</p><h3>{copy(locale, "Firmando tu QR seguro…", "Signing your secure QR…")}</h3><p>{copy(locale, "Esto toma un momento. El enlace será revocable desde esta consola.", "This takes a moment. The link will be revocable from this console.")}</p></div></div> : <div className="qr-ready"><button type="button" className="qr-tap-target" onClick={() => setExpanded(true)} aria-label={copy(locale, "Ampliar código QR", "Enlarge QR code")}><img className="qr-reveal" src={qrDataUrl} alt={copy(locale, "Código QR de credencial", "Credential QR code")} /><span><Maximize2 size={13} /> {copy(locale, "Toca para ampliar", "Tap to enlarge")}</span></button><div><p className="eyebrow aqua">{label === "handoff" ? "FOLIOS" : "HOSTCASA"}</p><h3>{heading}</h3><p>{copy(locale, "Comparte el enlace o escribe el mismo URI en una etiqueta NFC.", "Share the link or write the same URI to an NFC tag.")}</p><button type="button" onClick={() => onCopy(link!, `${label}-link`)}><Clipboard size={14} /> {copied === `${label}-link` ? <Check size={14} /> : null}{copy(locale, "Copiar enlace", "Copy link")}</button>{nfcUri ? <button type="button" onClick={() => onCopy(nfcUri, `${label}-nfc`)}><Nfc size={14} /> {copied === `${label}-nfc` ? <Check size={14} /> : null}NFC URI</button> : null}</div></div>}
    {expanded && qrDataUrl ? <div className="qr-dialog-backdrop" role="presentation" onMouseDown={() => setExpanded(false)}><section className="qr-dialog" role="dialog" aria-modal="true" aria-label={copy(locale, "Código QR ampliado", "Enlarged QR code")} onMouseDown={event => event.stopPropagation()}><button type="button" className="qr-dialog-close" onClick={() => setExpanded(false)} aria-label={copy(locale, "Cerrar", "Close")}><X size={18} /></button><p className="eyebrow aqua">{copy(locale, "CREDENCIAL SEGURA", "SECURE CREDENTIAL")}</p><img src={qrDataUrl} alt={copy(locale, "Código QR ampliado", "Enlarged QR code")} /><p>{copy(locale, "Escanéalo desde otro dispositivo o compártelo con el huésped.", "Scan it from another device or share it with the guest.")}</p></section></div> : null}
  </section>;
}
