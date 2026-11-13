import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { track } from "@/lib/analytics";
import { applyRouteMeta } from "@/lib/routeMeta";
import { type Locale, copy } from "@/lib/locale";
import QrCredentialPreview from "@/components/QrCredentialPreview";
import { TicketStatusPreview } from "@/components/TicketStatusPreview";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function Demo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [locale, setLocale] = useState<Locale>("en");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    applyRouteMeta("/demo");
    track("demo_start");
  }, []);

  useEffect(() => {
    if (currentStep === 5) {
      track("demo_complete");
    }
  }, [currentStep]);

  useEffect(() => {
    QRCode.toDataURL("https://staypass.dev/arrival/demo-token-sim", {
      width: 200,
      margin: 1,
      color: { dark: "#0A1018", light: "#F2F0E9" }
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, []);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 0, 0)); // prev - 1 Wait!

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentStep(prev => Math.min(prev + 1, 5));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentStep(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const stepTitles = [
    copy(locale, "Paso 1 — Operador crea estancia", "Step 1 — Operator creates a stay"),
    copy(locale, "Paso 2 — Código generado", "Step 2 — Code generated"),
    copy(locale, "Paso 3 — Vista del huésped", "Step 3 — Guest arrival view"),
    copy(locale, "Paso 4 — Ciclo de vida CFDI", "Step 4 — CFDI lifecycle"),
    copy(locale, "Paso 5 — Revocación", "Step 5 — Revocation"),
    copy(locale, "Paso 6 — Completado", "Step 6 — Complete")
  ];

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--osp-ink)] text-[var(--osp-paper)] selection:bg-[var(--osp-beacon)] selection:text-[var(--osp-ink)]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
      <SiteNav locale={locale} setLocale={setLocale} />
      
      <main className="flex-grow w-full flex flex-col items-center">
        {/* Banner */}
        <div className="w-full bg-[var(--osp-ink)] border-b border-[var(--osp-hairline)] text-[var(--osp-trace)] py-3 text-center text-sm font-mono uppercase tracking-widest px-4">
          {copy(locale, "Demostración interactiva — datos simulados. No se emite credencial real.", "Interactive demo — simulated data. No real credential is issued.")}
        </div>

        {/* Cinematic Film Layout */}
        <div className="flex-grow w-full max-w-[1440px] flex flex-col md:flex-row relative min-h-[600px]">
          
          {/* Left: Step Content */}
          <div className="w-full md:w-1/3 flex flex-col justify-between p-6 md:p-12 border-b md:border-b-0 md:border-r border-[var(--osp-hairline)] z-10 bg-[var(--osp-ink)]">
            <div className="flex-1">
              {/* Progress bar */}
              <div className="flex gap-2 mb-12">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`h-1 flex-1 ${i <= currentStep ? 'bg-[var(--osp-beacon)]' : 'bg-[var(--osp-hairline)]'}`} />
                ))}
              </div>

              <div className="font-mono text-xs text-[var(--osp-beacon)] mb-4 tracking-widest uppercase">
                {currentStep + 1} / 6
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-8">{stepTitles[currentStep]}</h1>

              <div className="text-[var(--osp-trace)]">
                {currentStep === 0 && <p>{copy(locale, "El operador registra los datos de la estancia. No se requiere una aplicación para el huésped.", "Operator registers stay details. No guest app required.")}</p>}
                {currentStep === 1 && <p>{copy(locale, "Se genera un enlace firmado criptográficamente. Se puede compartir por mensaje o escribir en una etiqueta NFC.", "A cryptographically signed link is generated. It can be shared via message or written to an NFC tag.")}</p>}
                {currentStep === 2 && <p>{copy(locale, "El huésped abre el enlace sin iniciar sesión. La guía de llegada proporciona reglas, WiFi y códigos temporales.", "Guest opens the link without logging in. Arrival guide provides rules, WiFi, and temporary codes.")}</p>}
                {currentStep === 3 && <p>{copy(locale, "El mismo enlace refleja el estado de la factura (CFDI) en tiempo real, desde borrador hasta timbrado.", "The exact same link reflects the invoice (CFDI) state in real-time, from draft to stamped.")}</p>}
                {currentStep === 4 && <p>{copy(locale, "El operador puede revocar el acceso en cualquier momento.", "The operator can revoke access at any time.")}</p>}
                {currentStep === 5 && <p>{copy(locale, "El enlace revocador invalida la credencial al instante. El huésped ya no puede ver la guía.", "The resolver instantly invalidates the credential. The guest can no longer view the guide.")}</p>}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))} 
                disabled={currentStep === 0} 
                className="px-6 py-3 font-mono text-xs tracking-widest uppercase border border-[var(--osp-hairline)] disabled:opacity-50 hover:border-[var(--osp-trace)] transition-colors min-h-[44px]"
              >
                {copy(locale, "Anterior", "Previous")}
              </button>
              <button 
                onClick={() => setCurrentStep(prev => Math.min(prev + 1, 5))} 
                disabled={currentStep === 5} 
                className="px-6 py-3 font-mono text-xs tracking-widest uppercase bg-[var(--osp-beacon)] text-[var(--osp-ink)] disabled:opacity-50 hover:bg-white transition-colors min-h-[44px] flex-1"
              >
                {copy(locale, "Siguiente", "Next")}
              </button>
            </div>
            <div className="text-[10px] font-mono text-[var(--osp-trace)] mt-4 uppercase tracking-widest">
              {copy(locale, "Usa las flechas del teclado", "Use keyboard arrows")}
            </div>
          </div>

          {/* Right: Live Artifact */}
          <div className="w-full md:w-2/3 relative overflow-hidden bg-[#060A10] flex items-center justify-center p-4 md:p-12 min-h-[400px]">
             {/* Subtle Grid */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, var(--osp-hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--osp-hairline) 1px, transparent 1px)', backgroundSize: '64px 64px', opacity: 0.3 }} />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-xl z-10"
              >
                {/* Artifact Content based on step */}
                {currentStep === 0 && (
                  <div className="bg-[var(--osp-ink)] border border-[var(--osp-hairline)] p-8 shadow-2xl">
                    <div className="font-mono text-xs text-[var(--osp-trace)] uppercase tracking-widest mb-8 border-b border-[var(--osp-hairline)] pb-4">Operator Console</div>
                    <div className="grid gap-6">
                      <div><div className="text-xs text-[var(--osp-trace)] font-mono mb-1">PROPERTY</div><div className="text-lg">La Casa de Barra</div></div>
                      <div><div className="text-xs text-[var(--osp-trace)] font-mono mb-1">GUEST NAME</div><div className="text-lg">M. Arriaga</div></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><div className="text-xs text-[var(--osp-trace)] font-mono mb-1">CHECK-IN</div><div className="text-lg">Tomorrow</div></div>
                        <div><div className="text-xs text-[var(--osp-trace)] font-mono mb-1">CHECK-OUT</div><div className="text-lg">+3 days</div></div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="bg-[var(--osp-ink)] border border-[var(--osp-hairline)] p-8 shadow-2xl flex flex-col items-center text-center">
                     <QrCredentialPreview
                        locale={locale}
                        isLoading={false}
                        qrDataUrl={qrDataUrl || undefined}
                        link="https://staypass.dev/arrival/demo-token-sim"
                        nfcUri="https://staypass.dev/arrival/demo-token-sim"
                        copied={copied}
                        label="arrival"
                        onCopy={handleCopy}
                      />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="bg-[var(--osp-paper)] text-[var(--osp-ink)] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="font-mono text-xs text-[var(--osp-trace)] uppercase tracking-widest mb-8 flex justify-between">
                      <span>{copy(locale, "LLEGADA", "ARRIVAL")}</span>
                      <span>ACTIVE</span>
                    </div>
                    <h2 className="text-3xl font-serif mb-6">La Casa de Barra</h2>
                    <div className="space-y-6">
                      <div className="border-t border-[var(--osp-trace)] pt-4">
                        <strong className="block text-sm uppercase tracking-widest mb-2 font-mono">Check-in</strong>
                        <p className="text-[var(--osp-ink)]">Lockbox at main gate. Code provided separately by operator.</p>
                      </div>
                      <div className="border-t border-[var(--osp-trace)] pt-4">
                        <strong className="block text-sm uppercase tracking-widest mb-2 font-mono">WiFi</strong>
                        <p className="text-[var(--osp-ink)]">BellaRed — ask operator for password</p>
                      </div>
                      <div className="border-t border-[var(--osp-trace)] pt-4">
                        <strong className="block text-sm uppercase tracking-widest mb-2 font-mono">Rules</strong>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>No smoking indoors</li>
                          <li>Quiet hours 10 PM - 8 AM</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="bg-[var(--osp-ink)] border border-[var(--osp-hairline)] p-8 shadow-2xl overflow-y-auto max-h-[70vh]">
                     <TicketStatusPreview />
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="bg-[var(--osp-ink)] border border-[var(--osp-hairline)] p-8 shadow-2xl text-center">
                    <div className="font-mono text-xs text-[var(--osp-trace)] uppercase tracking-widest mb-8 border-b border-[var(--osp-hairline)] pb-4">Operator Console</div>
                    <div className="py-12">
                      <div className="w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-red-500 text-2xl">!</span>
                      </div>
                      <h2 className="text-2xl font-bold mb-4">{copy(locale, "Revocar credencial", "Revoke Credential")}</h2>
                      <p className="text-[var(--osp-trace)] mb-8">{copy(locale, "El operador puede revocar el acceso en cualquier momento.", "Operator can revoke access at any time.")}</p>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="bg-[#1A1010] border border-red-900 p-8 shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                      <span className="text-9xl font-bold text-red-500 transform -rotate-12">REVOKED</span>
                    </div>
                    <div className="relative z-10 py-12">
                      <h2 className="text-3xl font-bold text-red-500 mb-4">{copy(locale, "Revocado", "Revoked")}</h2>
                      <p className="text-[var(--osp-trace)] mb-8">{copy(locale, "El resolver firmado confirma la revocación. El huésped ya no puede usar este enlace.", "The signed resolver confirms revocation. The guest cannot use this link.")}</p>
                      <a href="https://staypass-pmz7aqns.manus.space" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 font-mono text-xs tracking-widest uppercase bg-[var(--osp-beacon)] text-[var(--osp-ink)] hover:bg-white transition-colors min-h-[44px]">
                        {copy(locale, "Probar MVP real", "Try the live MVP")}
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
