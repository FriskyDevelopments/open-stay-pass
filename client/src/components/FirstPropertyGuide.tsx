import { copy, type Locale } from "@/lib/locale";
import { CheckCircle2, Home, QrCode } from "lucide-react";
import { useState } from "react";

type CreateStayInput = {
  propertyName: string;
  guestName: string;
  guestLocale: Locale;
  wifiName?: string;
  wifiPassword?: string;
  houseRules?: string;
  localRecommendations?: string;
  arrivalAt: Date;
  departureAt: Date;
};

type Props = {
  locale: Locale;
  isCreating: boolean;
  onCreate: (input: CreateStayInput) => void;
};

const localToday = () => new Date().toISOString().slice(0, 10);
const localTomorrow = () => new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

export default function FirstPropertyGuide({ locale, isCreating, onCreate }: Props) {
  const [draft, setDraft] = useState({
    propertyName: "",
    guestName: "",
    wifiName: "",
    wifiPassword: "",
    houseRules: "",
    localRecommendations: "",
    arrival: localToday(),
    departure: localTomorrow(),
  });
  const completed = [draft.propertyName, draft.guestName, draft.wifiName, draft.houseRules, draft.localRecommendations].filter(Boolean).length;
  const update = (key: keyof typeof draft, value: string) => setDraft(current => ({ ...current, [key]: value }));

  return <form className="operator-form host-form first-property-guide" onSubmit={event => {
    event.preventDefault();
    onCreate({
      propertyName: draft.propertyName,
      guestName: draft.guestName,
      guestLocale: locale,
      wifiName: draft.wifiName || undefined,
      wifiPassword: draft.wifiPassword || undefined,
      houseRules: draft.houseRules || undefined,
      localRecommendations: draft.localRecommendations || undefined,
      arrivalAt: new Date(`${draft.arrival}T12:00:00`),
      departureAt: new Date(`${draft.departure}T12:00:00`),
    });
  }}>
    <div className="form-heading"><div><p className="eyebrow aqua">HOSTCASA / {copy(locale, "PRIMERA PROPIEDAD", "FIRST PROPERTY")}</p><h2>{copy(locale, "Construye tu guía de llegada", "Build your arrival guide")}</h2></div><Home /></div>
    <div className="guide-progress"><span>{copy(locale, "Guía", "Guide")} {completed}/5</span><div><i style={{ width: `${completed * 20}%` }} /></div><small>{copy(locale, "Solo agrega lo que el huésped necesita para llegar bien.", "Add only what the guest needs to arrive well.")}</small></div>
    <div className="guide-workspace">
      <div className="guide-fields">
        <label>{copy(locale, "Propiedad", "Property")}<input required value={draft.propertyName} onChange={event => update("propertyName", event.target.value)} placeholder="La Casa de Barra" /></label>
        <label>{copy(locale, "Huésped", "Guest")}<input required value={draft.guestName} onChange={event => update("guestName", event.target.value)} placeholder="Frisky" /></label>
        <div className="form-split"><label>{copy(locale, "Llegada", "Arrival")}<input required type="date" value={draft.arrival} onChange={event => update("arrival", event.target.value)} /></label><label>{copy(locale, "Salida", "Departure")}<input required type="date" value={draft.departure} onChange={event => update("departure", event.target.value)} /></label></div>
        <label>Wi‑Fi<input value={draft.wifiName} onChange={event => update("wifiName", event.target.value)} placeholder="Casa-Barra" /></label>
        <label>{copy(locale, "Contraseña Wi‑Fi", "Wi‑Fi password")}<input value={draft.wifiPassword} onChange={event => update("wifiPassword", event.target.value)} placeholder={copy(locale, "Opcional", "Optional")} /></label>
        <label>{copy(locale, "Reglas", "House rules")}<textarea value={draft.houseRules} onChange={event => update("houseRules", event.target.value)} placeholder={copy(locale, "Silencio después de las 22:00; no fumar dentro.", "Quiet after 10pm; no smoking indoors.")} /></label>
        <label>{copy(locale, "Recomendaciones", "Recommendations")}<textarea value={draft.localRecommendations} onChange={event => update("localRecommendations", event.target.value)} placeholder={copy(locale, "Café cercano, estacionamiento, check-out…", "Nearby coffee, parking, check-out…")} /></label>
      </div>
      <aside className="guide-live-preview"><p className="eyebrow aqua">{copy(locale, "VISTA PREVIA DEL HUÉSPED", "GUEST PREVIEW")}</p><h3>{draft.propertyName || copy(locale, "Tu propiedad", "Your property")}</h3><p>{copy(locale, "Hola", "Hello")} {draft.guestName || copy(locale, "huésped", "guest")}. {copy(locale, "Tu llegada está lista.", "Your arrival is ready.")}</p><div className="preview-detail"><CheckCircle2 size={14} /><span>{draft.wifiName ? `Wi‑Fi: ${draft.wifiName}` : copy(locale, "Wi‑Fi pendiente", "Wi‑Fi pending")}</span></div><div className="preview-detail"><CheckCircle2 size={14} /><span>{draft.houseRules ? copy(locale, "Reglas listas", "Rules ready") : copy(locale, "Reglas pendientes", "Rules pending")}</span></div><div className="preview-detail"><CheckCircle2 size={14} /><span>{draft.localRecommendations ? copy(locale, "Recomendaciones listas", "Recommendations ready") : copy(locale, "Recomendaciones pendientes", "Recommendations pending")}</span></div><div className="preview-qr-ghost"><QrCode size={35} /><span>{copy(locale, "QR seguro", "Secure QR")}</span></div></aside>
    </div>
    <button className="form-submit host-submit" disabled={isCreating}><QrCode size={16} /> {isCreating ? copy(locale, "Generando credencial…", "Generating credential…") : copy(locale, "Generar QR y enlace", "Generate QR and link")}</button>
  </form>;
}
