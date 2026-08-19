import { LanguageToggle } from "@/components/LanguageToggle";
import { copy, type Locale } from "@/lib/locale";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Cable, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Integrations() {
  const [locale, setLocale] = useState<Locale>("es");
  const plan = trpc.openStay.public.integrations.useQuery({ locale });
  return <main className="integration-page"><header className="public-nav"><Link href="/" className="brand-combo">HOSTCASA <span>×</span> FOLIOS</Link><LanguageToggle locale={locale} onChange={setLocale} /></header><section className="integration-copy"><p className="eyebrow emerald">{copy(locale, "Integraciones progresivas", "Progressive integrations")}</p><h1>{copy(locale, "Conecta cuando agregue valor. Nunca antes.", "Connect when it adds value. Never before.")}</h1><p>{copy(locale, "El QR, la guía y el handoff no necesitan una integración para ser útiles. Nango vive en el borde opcional; las credenciales y autorizaciones siguen dentro de Open Stay Pass.", "QR, the guide, and the handoff do not need an integration to be useful. Nango lives at the optional edge; credentials and authorization remain inside Open Stay Pass.")}</p><div className="integration-passline"><ShieldCheck size={16} /><span>VERIFIED PASS</span><i /> <span>NANGO AT THE OPTIONAL EDGE</span></div></section>{plan.isLoading ? <div className="loading-row"><Loader2 className="spin" /> Loading</div> : <section className="integration-list">{plan.data?.map(item => <article key={item.name}><div className="integration-mark"><Cable size={18} /></div><div><p className="eyebrow">{item.category} · {item.state === "available" ? copy(locale, "Opcional", "Optional") : copy(locale, "Diseño requerido", "Design required")}</p><h2>{item.name}</h2><p>{item.description}</p></div>{item.category === "Custom" ? <ShieldCheck size={20} /> : null}</article>)}</section>}<Link href="/" className="back-link"><ArrowLeft size={16} /> {copy(locale, "Volver a Open Stay Pass", "Back to Open Stay Pass")}</Link></main>;
}
