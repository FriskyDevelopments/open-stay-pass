import { LanguageToggle } from "@/components/LanguageToggle";
import { copy, type Locale } from "@/lib/locale";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Circle, ExternalLink, Loader2, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRoute } from "wouter";

export default function Handoff() {
  const [, params] = useRoute("/handoff/:token");
  const token = params?.token ?? "";
  const [locale, setLocale] = useState<Locale>("es");
  const handoff = trpc.openStay.public.handoff.useQuery({ token, locale }, { enabled: Boolean(token), retry: false });
  const complete = trpc.openStay.public.completeHandoff.useMutation({ onSuccess: () => handoff.refetch() });
  if (handoff.isLoading) return <div className="status-screen folios-surface"><Loader2 className="spin" /> <span>{copy(locale, "Abriendo el handoff…", "Opening the handoff…")}</span></div>;
  if (handoff.error || !handoff.data) return <div className="status-screen folios-surface"><ShieldCheck size={28} /><h1>{copy(locale, "Este enlace ya no está disponible", "This link is no longer available")}</h1><p>{copy(locale, "Pide un enlace nuevo al operador.", "Ask the operator for a new link.")}</p></div>;
  const { handoff: item } = handoff.data;
  const steps = [
    [copy(locale, "Capturar", "Capture"), item.sourceContent],
    [copy(locale, "Contexto", "Context"), item.context],
    [copy(locale, "Revisar", "Check"), item.checkState === "ready" ? copy(locale, "Listo para compartir", "Ready to share") : copy(locale, "Necesita revisión", "Needs review")],
    [copy(locale, "Responsable", "Owner"), item.ownerName],
    [copy(locale, "Enviar", "Hand off"), item.status === "completed" ? copy(locale, "Handoff completado", "Handoff complete") : copy(locale, "Confirmar y enviar el enlace", "Confirm and send the link")],
  ];
  const stateLabel = item.status === "completed" ? copy(locale, "● COMPLETADO", "● COMPLETED") : item.checkState === "ready" ? copy(locale, "● LISTO", "● READY") : copy(locale, "○ REVISAR", "○ REVIEW");
  return <main className="handoff-page folios-surface"><header className="guest-header"><div className="folios-lockup">FOLIOS<span>.WORKS</span><small>{copy(locale, "UN REGISTRO", "ONE RECORD")}</small></div><LanguageToggle locale={locale} onChange={setLocale} /></header><section className="folio-hero"><p className="eyebrow emerald">{copy(locale, "HANDOFF DE PRUEBA", "PROOF HANDOFF")}</p><h1>{item.title}</h1><p>{copy(locale, "Una cosa clara. Un siguiente movimiento.", "One clear thing. One next move.")}</p><div className={`folio-status ${item.status}`}>{stateLabel}</div></section><section className="handoff-steps">{steps.map(([label, body], index) => <article key={label} className={`handoff-step ${index === 4 ? "handoff-final" : ""}`}><div className="step-index">{index === 4 && item.status !== "completed" ? <Circle size={18} /> : <CheckCircle2 size={18} />}{String(index + 1).padStart(2, "0")}</div><div><p className="eyebrow">{label}</p><p>{body}</p></div>{index === 0 && item.sourceType === "link" ? <ExternalLink size={16} /> : null}</article>)}</section>{item.status !== "completed" ? <button className="complete-handoff" type="button" onClick={() => complete.mutate({ token, locale })} disabled={complete.isPending}><Send size={17} /> {copy(locale, "Completar handoff", "Complete handoff")}</button> : <div className="completed-note"><CheckCircle2 size={18} /> {copy(locale, "El operador fue notificado.", "The operator was notified.")}</div>}<footer className="guest-footer">{copy(locale, "Prueba y siguiente paso", "Proof and next step")} · FOLIOS.WORKS</footer></main>;
}
