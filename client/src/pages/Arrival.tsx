import { LanguageToggle } from "@/components/LanguageToggle";
import { copy, formatDate, type Locale } from "@/lib/locale";
import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, MessageCircle, ShieldCheck, Wifi } from "lucide-react";
import { useState } from "react";
import { useRoute } from "wouter";

export default function Arrival() {
  const [, params] = useRoute("/arrival/:token");
  const token = params?.token ?? "";
  const [locale, setLocale] = useState<Locale>("es");
  const [question, setQuestion] = useState("");
  const arrival = trpc.openStay.public.arrival.useQuery({ token, locale }, { enabled: Boolean(token), retry: false });
  const concierge = trpc.openStay.public.concierge.useMutation();

  if (arrival.isLoading) return <div className="status-screen hostcasa-surface"><Loader2 className="spin" /> <span>{copy(locale, "Abriendo tu llegada…", "Opening your arrival…")}</span></div>;
  if (arrival.error || !arrival.data) return <div className="status-screen hostcasa-surface"><ShieldCheck size={28} /><h1>{copy(locale, "Este enlace ya no está disponible", "This link is no longer available")}</h1><p>{copy(locale, "Pide un enlace nuevo al anfitrión.", "Ask your host for a new link.")}</p></div>;

  const { stay, credential } = arrival.data;
  const ask = () => {
    if (question.trim()) concierge.mutate({ token, locale, question });
  };

  return (
    <main className="arrival-page hostcasa-surface">
      <header className="guest-header"><div className="hostcasa-lockup"><span className="hostcasa-mark">◒</span><span>HOSTCASA</span><small>{copy(locale, "Hospitalidad, elevada.", "Hospitality, elevated.")}</small></div><LanguageToggle locale={locale} onChange={setLocale} /></header>
      <section className="arrival-hero">
        <p className="eyebrow aqua">{copy(locale, "Llegada verificada", "Verified arrival")}</p>
        <h1>{copy(locale, "Bienvenido a", "Welcome to")} <em>{stay.propertyName}</em></h1>
        <p>{copy(locale, "Hola", "Hello")} {stay.guestName}. {copy(locale, "Tu guía de estancia está lista.", "Your stay guide is ready.")}</p>
        <div className="arrival-dates"><span>{formatDate(stay.arrivalAt, locale)}</span><i /> <span>{formatDate(stay.departureAt, locale)}</span></div>
      </section>
      <section className="arrival-grid">
        <article className="guest-card wifi-card"><div className="card-icon"><Wifi size={20} /></div><p className="eyebrow">WI-FI</p><h2>{stay.wifiName || copy(locale, "Consulta al anfitrión", "Ask your host")}</h2>{stay.wifiPassword ? <code>{stay.wifiPassword}</code> : <p>{copy(locale, "La contraseña se compartirá al llegar.", "The password will be shared on arrival.")}</p>}</article>
        <article className="guest-card"><div className="card-icon"><ShieldCheck size={20} /></div><p className="eyebrow">{copy(locale, "Casa", "Home")}</p><h2>{copy(locale, "Reglas que cuidan la estancia", "Rules that protect the stay")}</h2><p>{stay.houseRules || copy(locale, "El anfitrión aún no agregó reglas a esta guía.", "Your host has not added rules to this guide yet.")}</p></article>
        <article className="guest-card"><div className="card-icon"><MapPin size={20} /></div><p className="eyebrow">{copy(locale, "Cerca", "Nearby")}</p><h2>{copy(locale, "Recomendaciones locales", "Local recommendations")}</h2><p>{stay.localRecommendations || copy(locale, "El anfitrión aún no agregó recomendaciones.", "Your host has not added recommendations yet.")}</p></article>
      </section>
      <section className="concierge-panel"><div><p className="eyebrow aqua">CONCIERGE AI</p><h2>{copy(locale, "Pregunta sobre tu estancia", "Ask about your stay")}</h2><p>{copy(locale, "Respuestas basadas únicamente en la información aprobada por tu anfitrión.", "Answers are grounded only in information approved by your host.")}</p></div><div className="concierge-input"><textarea value={question} onChange={event => setQuestion(event.target.value)} placeholder={copy(locale, "¿Cómo funciona el Wi-Fi?", "How does the Wi-Fi work?")} /><button type="button" onClick={ask} disabled={concierge.isPending}><MessageCircle size={17} /> {copy(locale, "Preguntar", "Ask")}</button></div>{concierge.data ? <div className="concierge-answer"><span>{concierge.data.mode === "live" ? "LIVE" : copy(locale, "GUÍA", "GUIDE")}</span><p>{concierge.data.answer}</p></div> : null}</section>
      <footer className="guest-footer">{copy(locale, "Enlace seguro", "Secure link")} · {credential.status === "active" ? copy(locale, "activo", "active") : credential.status}</footer>
    </main>
  );
}
