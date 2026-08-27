import { LanguageToggle } from "@/components/LanguageToggle";
import { copy, type Locale } from "@/lib/locale";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Cable, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

type CarrierState = {
  label: string;
  description: string;
  tone: "system" | "verified";
};

export default function Integrations() {
  const [locale, setLocale] = useState<Locale>("en");
  const plan = trpc.openStay.public.integrations.useQuery({ locale });
  const appleWallet = trpc.openStay.public.walletStatus.useQuery({ platform: "apple", locale });
  const googleWallet = trpc.openStay.public.walletStatus.useQuery({ platform: "google", locale });

  const walletState = (platform: "apple" | "google"): CarrierState => {
    const status = platform === "apple" ? appleWallet.data : googleWallet.data;
    if (!status || status.state !== "ready") {
      return {
        label: copy(locale, "Requiere configuración", "Configuration required"),
        description: platform === "apple"
          ? copy(locale, "La emisión se activa solo cuando la firma y la elegibilidad fiscal están configuradas.", "Issuance activates only when signing and fiscal eligibility are configured.")
          : copy(locale, "La emisión permanece bloqueada hasta que la cuenta de servicio pueda firmar de forma verificable.", "Issuance remains gated until the service account can sign verifiably."),
        tone: "system",
      };
    }
    return {
      label: copy(locale, "Pase firmado · disponible", "Signed pass · available"),
      description: copy(locale, "Solo para comprobantes CFDI emitidos y credenciales de handoff activas.", "Only for issued CFDI records and active handoff credentials."),
      tone: "verified",
    };
  };

  const apple = walletState("apple");
  const google = walletState("google");

  return (
    <main className="integration-page">
      <header className="public-nav">
        <Link href="/" className="brand-combo">HOSTCASA <span>×</span> FOLIOS</Link>
        <LanguageToggle locale={locale} onChange={setLocale} />
      </header>

      <section className="integration-copy">
        <p className="eyebrow emerald">{copy(locale, "Mapa de integraciones", "Integration map")}</p>
        <h1>{copy(locale, "La credencial no depende de tu stack.", "The credential does not depend on your stack.")}</h1>
        <p>{copy(locale, "Este es el orden de confianza: la credencial QR funciona primero; NFC y Wallet transportan el mismo resolver firmado; las conexiones externas aportan contexto sin heredar autoridad.", "This is the trust order: the QR credential works first; NFC and Wallet carry the same signed resolver; external connections add context without inheriting authority.")}</p>
        <div className="integration-passline"><ShieldCheck size={16} /><span>VERIFIED PASS</span><i /> <span>OPTIONAL EDGE</span></div>
      </section>

      <section className="integration-map" aria-label={copy(locale, "Mapa de capacidades de Open Stay Pass", "Open Stay Pass capability map")}>
        <div className="integration-map-head">
          <div><p className="eyebrow aqua">{copy(locale, "Núcleo independiente", "Independent core")}</p><h2>{copy(locale, "Una ruta. Cuatro portadores.", "One resolver. Four carriers.")}</h2></div>
          <p>{copy(locale, "El estado describe disponibilidad real; no una promesa comercial.", "The state describes actual availability, not a commercial promise.")}</p>
        </div>
        <div className="integration-carriers">
          <article className="carrier-card proof"><span>01 · QR</span><h3>{copy(locale, "Resolver firmado", "Signed resolver")}</h3><p>{copy(locale, "La credencial de llegada o handoff estable. Se puede revocar y expira.", "The stable arrival or handoff credential. Revocable and expiring.")}</p><b>{copy(locale, "Núcleo activo", "Active core")}</b></article>
          <article className="carrier-card system"><span>02 · NFC</span><h3>{copy(locale, "NDEF URL", "NDEF URL")}</h3><p>{copy(locale, "Solo transporta la URL HTTPS firmada. Nunca un PIN, llave BLE ni autorización permanente.", "Carries only the signed HTTPS URL. Never a PIN, BLE key, or permanent authorization.")}</p><b>{copy(locale, "Portador seguro", "Safe carrier")}</b></article>
          <article className={`carrier-card ${apple.tone}`}><span>03 · APPLE</span><h3>Apple Wallet</h3><p>{apple.description}</p><b>{apple.label}</b></article>
          <article className={`carrier-card ${google.tone}`}><span>04 · GOOGLE</span><h3>Google Wallet</h3><p>{google.description}</p><b>{google.label}</b></article>
        </div>
        <div className="integration-map-rule"><span>{copy(locale, "La credencial resuelve; el proveedor ejecuta.", "The credential resolves; the provider executes.")}</span><i /><span>{copy(locale, "Menor privilegio por diseño", "Least authority by design")}</span></div>
      </section>

      {plan.isLoading ? <div className="loading-row"><Loader2 className="spin" /> {copy(locale, "Cargando conexiones", "Loading connections")}</div> : (
        <section className="integration-catalog">
          <div className="integration-catalog-intro"><p className="eyebrow">{copy(locale, "Borde opcional", "Optional edge")}</p><h2>{copy(locale, "Conecta contexto, no credenciales.", "Connect context, not credentials.")}</h2><p>{copy(locale, "Activa estas conexiones cuando una operación pequeña ya tenga una razón concreta para usarlas.", "Activate these connections when a small operation has a concrete reason to use them.")}</p></div>
          <div className="integration-list">{plan.data?.map((item, index) => {
            const isSmartLock = item.name === copy(locale, "Cerraduras inteligentes", "Smart locks");
            const available = item.state === "available";
            return <article key={item.name} className={`${isSmartLock ? "smart-lock-integration " : ""}${available ? "integration-available" : "integration-custom"}`}>
              <div className="integration-index">{String(index + 5).padStart(2, "0")}</div>
              <div className="integration-mark">{isSmartLock ? <KeyRound size={18} /> : <Cable size={18} />}</div>
              <div><p className="eyebrow">{item.category}</p><h3>{item.name}</h3><p>{item.description}</p>{isSmartLock ? <div className="smart-lock-boundary"><span><b>01</b> {copy(locale, "QR, NFC y Wallet: enlace firmado", "QR, NFC, and Wallet: signed link")}</span><span><b>02</b> {copy(locale, "HostCasa/proveedor: provisión externa", "HostCasa/provider: external provisioning")}</span><span><b>03</b> {copy(locale, "Cerradura: acceso físico y auditoría", "Lock: physical access and audit")}</span></div> : null}</div>
              <div className="integration-state"><span className={available ? "available" : "required"}>{available ? copy(locale, "Opcional", "Optional") : copy(locale, "Diseño requerido", "Design required")}</span>{item.category === "Custom" ? <ShieldCheck size={18} /> : null}</div>
            </article>;
          })}</div>
        </section>
      )}

      <section className="integration-boundary"><div><p className="eyebrow aqua">{copy(locale, "Límite de cerradura", "Lock boundary")}</p><h2>{copy(locale, "Acceso físico pertenece al proveedor.", "Physical access belongs to the provider.")}</h2></div><p>{copy(locale, "Open Stay Pass no provisiona ni guarda secretos de cerradura en QR, NFC o Wallet. Un adaptador se diseña después de elegir proveedor, permisos y auditoría.", "Open Stay Pass does not provision or store lock secrets in QR, NFC, or Wallet. An adapter is designed after choosing a provider, permissions, and audit model.")}</p></section>
      <Link href="/" className="back-link"><ArrowLeft size={16} /> {copy(locale, "Volver a Open Stay Pass", "Back to Open Stay Pass")}</Link>
    </main>
  );
}
