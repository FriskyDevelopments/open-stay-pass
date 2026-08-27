import { copy, type Locale } from "@/lib/locale";
import { ndefUrlPayload } from "@/lib/nfc";
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
  const [terminalReceipt, setTerminalReceipt] = useState<string | null>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  if (!isLoading && (!qrDataUrl || !link)) return null;
  const heading = label === "handoff" ? copy(locale, "Handoff seguro listo", "Secure handoff ready") : copy(locale, "Tu credencial está lista", "Your credential is ready");
  const safeNdefUri = nfcUri ? ndefUrlPayload(nfcUri) : null;
  const copyWithReceipt = (value: string, copyLabel: string) => {
    onCopy(value, copyLabel);
    const carrier = copyLabel.endsWith("-nfc") ? "nfc" : "qr";
    let receiptTarget = "signed-resolver · token:redacted";
    try {
      const target = new URL(value);
      const shortPath = target.pathname.length > 20 ? `${target.pathname.slice(0, 20)}…` : target.pathname;
      receiptTarget = `${target.host}${shortPath} · token:redacted`;
    } catch {
      // Copy can safely proceed even when the caller gives a non-URL value; never print that value here.
    }
    setTerminalReceipt(`$ osp.copy --surface=${label} --carrier=${carrier}\n✓ resolver copied · ${receiptTarget}`);
  };
  return <section className="qr-credential-preview" aria-live="polite">
    {isLoading ? <div className="qr-loading"><span className="qr-loading-grid"><Loader2 className="spin" /></span><div><p className="eyebrow aqua">OPEN STAY PASS</p><h3>{copy(locale, "Firmando tu QR seguro…", "Signing your secure QR…")}</h3><p>{copy(locale, "Esto toma un momento. El enlace será revocable desde esta consola.", "This takes a moment. The link will be revocable from this console.")}</p></div></div> : <div className="qr-ready"><button type="button" className="qr-tap-target" onClick={() => setExpanded(true)} aria-label={copy(locale, "Ampliar código QR", "Enlarge QR code")}><img className="qr-reveal" src={qrDataUrl} alt={copy(locale, "Código QR de credencial", "Credential QR code")} /><span><Maximize2 size={13} /> {copy(locale, "Toca para ampliar", "Tap to enlarge")}</span></button><div><p className="eyebrow aqua">{label === "handoff" ? "FOLIOS" : "HOSTCASA"}</p><h3>{heading}</h3><p>{copy(locale, "Comparte el enlace o escribe el mismo URI en una etiqueta NFC. La etiqueta nunca contiene un código de puerta ni un secreto de cerradura.", "Share the link or write the same URI to an NFC tag. The tag never contains a door code or lock secret.")}</p><button type="button" onClick={() => copyWithReceipt(link!, `${label}-link`)}><Clipboard size={14} /> {copied === `${label}-link` ? <Check size={14} /> : null}{copy(locale, "Copiar enlace", "Copy link")}</button>{safeNdefUri ? <button type="button" onClick={() => copyWithReceipt(safeNdefUri, `${label}-nfc`)}><Nfc size={14} /> {copied === `${label}-nfc` ? <Check size={14} /> : null}{copy(locale, "Copiar URL NDEF", "Copy NDEF URL")}</button> : null}{terminalReceipt ? <output className="credential-copy-terminal" aria-live="polite"><span>{terminalReceipt.split("\n")[0]}</span><b>{terminalReceipt.split("\n")[1]}</b></output> : null}</div></div>}
    {expanded && qrDataUrl ? <div className="qr-dialog-backdrop" role="presentation" onMouseDown={() => setExpanded(false)}><section className="qr-dialog" role="dialog" aria-modal="true" aria-label={copy(locale, "Código QR ampliado", "Enlarged QR code")} onMouseDown={event => event.stopPropagation()}><button type="button" className="qr-dialog-close" onClick={() => setExpanded(false)} aria-label={copy(locale, "Cerrar", "Close")}><X size={18} /></button><p className="eyebrow aqua">{copy(locale, "CREDENCIAL SEGURA", "SECURE CREDENTIAL")}</p><img src={qrDataUrl} alt={copy(locale, "Código QR ampliado", "Enlarged QR code")} /><p>{copy(locale, "Escanéalo desde otro dispositivo o compártelo con el huésped.", "Scan it from another device or share it with the guest.")}</p></section></div> : null}
  </section>;
}
