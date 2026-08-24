import { useState } from "react";
import jsQR from "jsqr";
import { ScanLine } from "lucide-react";
import { copy, type Locale } from "@/lib/locale";

export function decodeQrPixels(data: Uint8ClampedArray, width: number, height: number) {
  const code = jsQR(data, width, height);
  return code?.data ?? null;
}

export function isSupportedSignedTarget(value: string) {
  try { const target = new URL(value); return (target.protocol === "https:" || target.protocol === "http:") && (/\/(arrival|handoff)\//.test(target.pathname)) && target.pathname.split("/").filter(Boolean).length >= 2; } catch { return false; }
}

export function QrCodeToText({ locale, onDecoded, onVerify }: { locale: Locale; onDecoded?: (value: string) => void; onVerify?: (value: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const decode = (file: File) => {
    setError(""); setValue("");
    const url = URL.createObjectURL(file); const image = new Image(); image.onload = () => {
      try {
        const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d"); if (!context) throw new Error("canvas");
        context.drawImage(image, 0, 0); const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = decodeQrPixels(pixels.data, pixels.width, pixels.height);
        if (!decoded) throw new Error("unreadable");
        setValue(decoded); onDecoded?.(decoded);
      } catch { setError(copy(locale, "No se pudo leer el QR. Sube una imagen más clara.", "QR unreadable. Upload a clearer image.")); }
      finally { URL.revokeObjectURL(url); }
    }; image.onerror = () => { URL.revokeObjectURL(url); setError(copy(locale, "No se pudo abrir la imagen.", "Could not open the image.")); }; image.src = url;
  };
  return <section className="qr-text-reader"><div className="section-title"><div><p className="eyebrow">QR · TEXT</p><h2>{copy(locale, "Leer un QR", "Read a QR")}</h2></div><ScanLine size={19} /></div><p>{copy(locale, "Decodifica el enlace y después deja que el servidor valide firma, alcance y expiración.", "Decode the link, then let the server validate signature, scope, and expiry.")}</p><label className="qr-upload">{copy(locale, "Seleccionar imagen", "Choose image")}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) decode(file); }} /></label>{error ? <p className="qr-reader-error" role="alert">{error}</p> : null}{value ? <><code className="qr-reader-value">{value}</code>{isSupportedSignedTarget(value) ? <button type="button" className="qr-reader-verify" onClick={() => onVerify?.(value)}>{copy(locale, "Abrir y validar enlace", "Open and validate link")}</button> : <p className="qr-reader-error">{copy(locale, "Este texto no parece un enlace firmado de llegada o handoff.", "This text is not a signed arrival or handoff link.")}</p>}</> : null}</section>;
}
