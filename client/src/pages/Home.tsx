import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { copy, type Locale } from "@/lib/locale";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { motion, useScroll, useSpring, useTransform, useInView, useReducedMotion } from "framer-motion";
import { applyRouteMeta } from "@/lib/routeMeta";

function SignedStrokeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 44 C 20 8, 36 10, 30 30 C 26 42, 14 46, 15 38 C 16 28, 40 20, 56 26 C 64 29, 70 32, 78 32" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="84" y="27" width="6" height="6" fill="currentColor" />
      <rect x="93" y="23" width="5" height="5" fill="currentColor" />
      <rect x="101" y="19" width="4" height="4" fill="currentColor" />
    </svg>
  );
}

function HeroArtifact() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { margin: "-100px", once: false });
  const prefersReducedMotion = useReducedMotion();
  
  const shouldAnimate = isInView && !prefersReducedMotion;
  
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  useEffect(() => {
    import("qrcode").then((QRCode) => {
      QRCode.default.toDataURL("https://staypass.dev/arrival/demo-token-sim", {
        width: 200,
        margin: 1,
        color: { dark: "#0A1018", light: "#F2F0E9" }
      }).then(setQrDataUrl).catch(() => {});
    });
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[400px] md:max-w-none md:w-[480px] flex-shrink-0">
      <div className="w-full relative aspect-[4/5] bg-[var(--osp-paper)] text-[var(--osp-ink)] p-6 md:p-8 flex flex-col justify-between shadow-2xl z-10">
        <div className="flex justify-between items-start font-mono text-xs uppercase tracking-widest text-[var(--osp-trace)]">
          <span>OPEN STAY PASS</span>
          <span>RECORD #8A2F</span>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="relative w-40 h-40 md:w-56 md:h-56 bg-[var(--osp-ink)] p-4">
            {qrDataUrl && <img src={qrDataUrl} alt="Live QR" className="w-full h-full object-contain" />}
            
            {/* Scan Line */}
            {shouldAnimate && (
              <motion.div 
                className="absolute left-0 right-0 h-1 bg-[var(--osp-beacon)] z-20 shadow-[0_0_12px_var(--osp-beacon)]"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
              />
            )}
            {!shouldAnimate && (
              <div className="absolute left-0 right-0 top-[50%] h-1 bg-[var(--osp-beacon)] z-20 shadow-[0_0_12px_var(--osp-beacon)]" />
            )}
          </div>
          
          {/* Status Label */}
          <div className="mt-8 font-mono text-sm tracking-widest flex items-center gap-2">
            RESOLVER / 
            {shouldAnimate ? (
              <motion.span 
                animate={{ color: ["var(--osp-trace)", "var(--osp-beacon)", "var(--osp-beacon)"] }}
                transition={{ duration: 3, times: [0, 0.5, 1], repeat: Infinity }}
                className="font-bold"
              >
                SIGNED
              </motion.span>
            ) : (
              <span className="font-bold text-[var(--osp-beacon)]">SIGNED</span>
            )}
            · EXP 72H
          </div>
        </div>

        {/* Arrival Card Slide-in */}
        <motion.div 
          className="absolute -bottom-8 -right-8 md:-right-16 w-3/4 bg-[var(--osp-ink)] text-[var(--osp-paper)] p-4 md:p-6 border border-[var(--osp-hairline)] shadow-2xl z-20"
          initial={prefersReducedMotion ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          animate={shouldAnimate ? { y: [50, 0, 0, 50], opacity: [0, 1, 1, 0] } : { y: 0, opacity: 1 }}
          transition={{ duration: 6, times: [0, 0.2, 0.8, 1], ease: [0.16, 1, 0.3, 1], repeat: Infinity }}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono text-[10px] text-[var(--osp-beacon)] tracking-widest uppercase">ACTIVE</span>
            <SignedStrokeMark className="w-8 h-8 text-[var(--osp-paper)]" />
          </div>
          <div className="font-serif text-xl md:text-2xl mb-1">La Casa de Barra</div>
          <div className="text-xs text-[var(--osp-trace)] font-mono">GUEST: M. ARRIAGA</div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start end", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  useEffect(() => { applyRouteMeta("/"); }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--osp-ink)] text-[var(--osp-paper)] selection:bg-[var(--osp-beacon)] selection:text-[var(--osp-ink)]" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
      <SiteNav locale={locale} setLocale={setLocale} />
      
      <main className="flex-grow w-full overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative w-full min-h-[90vh] flex flex-col justify-center items-center pt-24 pb-16 md:py-32 border-b border-[var(--osp-hairline)] px-4 md:px-12">
          {/* Hairline Grid Background */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, var(--osp-hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--osp-hairline) 1px, transparent 1px)', backgroundSize: '100px 100px', opacity: 0.5 }} />
          
          <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24 relative z-10">
            
            <div className="flex-1 flex flex-col items-start text-left w-full">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
                <SignedStrokeMark className="w-24 h-12 text-[var(--osp-beacon)]" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="font-bold tracking-tighter leading-[1.05] text-[clamp(3rem,8vw,8rem)] mb-8 max-w-[14ch]"
              >
                {copy(locale, "Los huéspedes no deberían necesitar seis apps para llegar.", "Guests should not need six apps to arrive.")}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="text-lg md:text-2xl text-[var(--osp-trace)] max-w-[32ch] mb-12 font-medium"
              >
                {copy(locale, "Un enlace firmado y revocable que unifica la experiencia de llegada, verificación y entrega.", "One signed, revocable link that unifies the arrival, verification, and handoff experience.")}
              </motion.p>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link href="/demo" className="px-8 py-4 font-bold text-center text-[var(--osp-ink)] bg-[var(--osp-beacon)] hover:bg-white transition-colors min-h-[44px] flex items-center justify-center uppercase tracking-widest text-sm">
                  {copy(locale, "Probar demostración", "Try the demo")}
                </Link>
                <Link href="/start" className="px-8 py-4 font-bold text-center border border-[var(--osp-hairline)] hover:border-[var(--osp-trace)] transition-colors min-h-[44px] flex items-center justify-center uppercase tracking-widest text-sm">
                  {copy(locale, "Empezar", "Get started")}
                </Link>
              </motion.div>
            </div>

            <HeroArtifact />

          </div>
        </section>

        {/* HOW IT WORKS RAIL */}
        <section ref={scrollRef} className="w-full py-32 px-4 md:px-12 border-b border-[var(--osp-hairline)] relative">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-20 tracking-tight">
              {copy(locale, "Cómo funciona", "How it works")}
            </h2>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-[1px] bg-[var(--osp-hairline)] z-0" />
              <motion.div 
                className="hidden md:block absolute top-8 left-0 right-0 h-[1px] bg-[var(--osp-beacon)] z-0 origin-left"
                style={{ scaleX }}
              />

              <div className="flex flex-col md:flex-row gap-12 md:gap-0 justify-between relative z-10">
                {[
                  { step: "01", title: copy(locale, "Escanear", "Scan"), desc: copy(locale, "QR o etiqueta NDEF", "QR or NDEF tag"), picto: "picto-scan.svg" },
                  { step: "02", title: copy(locale, "Verificar", "Verify"), desc: copy(locale, "El resolver firmado verifica", "Signed resolver verifies"), picto: "picto-route.svg" },
                  { step: "03", title: copy(locale, "Llegar", "Arrive"), desc: copy(locale, "Guía de llegada", "HostCasa arrival guide"), picto: "picto-arrival.svg" },
                  { step: "04", title: copy(locale, "Entregar", "Handoff"), desc: copy(locale, "Entrega de prueba", "Folios proof handoff"), picto: "picto-pass.svg" }
                ].map((item, i) => (
                  <div key={item.step} className="flex flex-col items-start md:items-center text-left md:text-center w-full md:w-1/4">
                    <div className="w-16 h-16 bg-[var(--osp-ink)] border border-[var(--osp-hairline)] flex items-center justify-center mb-6 z-10">
                      <img src={`/brand/${item.picto}`} alt="" className="w-8 h-8 opacity-80" />
                    </div>
                    <div className="font-mono text-xs text-[var(--osp-beacon)] mb-4 tracking-widest">{item.step}</div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-[var(--osp-trace)] text-sm max-w-[200px]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
