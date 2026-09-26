import { useState, useEffect } from "react";
import { Link } from "wouter";
import { copy, type Locale } from "@/lib/locale";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { motion } from "framer-motion";
import { applyRouteMeta } from "@/lib/routeMeta";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    applyRouteMeta("/");
  }, []);

  const ink = "#0A1018";
  const paper = "#F2F0E9";
  const beacon = "#4DA6FF";
  const trace = "#93A0AD";
  const hairline = "#1E2A3A";
  const amber = "#FFB300";

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: ink, color: paper, fontFamily: "Hanken Grotesk, sans-serif" }}>
      <SiteNav locale={locale} setLocale={setLocale} />
      
      <main className="flex-grow flex flex-col w-full">
        {/* Section 1: Hero */}
        <section className="relative w-full px-4 sm:px-6 pt-24 pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="mb-8"
          >
            <svg width="32" height="32" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" className="mx-auto opacity-70">
              <path d="M8 44 C 20 8, 36 10, 30 30 C 26 42, 14 46, 15 38 C 16 28, 40 20, 56 26 C 64 29, 70 32, 78 32" stroke={beacon} strokeWidth="3.5" fill="none" />
              <rect x="84" y="27" width="6" height="6" fill={beacon} />
              <rect x="93" y="23" width="5" height="5" fill={beacon} />
              <rect x="101" y="19" width="4" height="4" fill={beacon} />
            </svg>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-tight"
          >
            {copy(locale, "Los huéspedes no deberían necesitar seis apps para llegar.", "Guests should not need six apps to arrive.")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: "easeOut", delay: 0.1 }}
            className="text-lg sm:text-xl max-w-2xl mb-12"
            style={{ color: trace }}
          >
            {copy(locale, "Un enlace firmado y revocable que unifica la experiencia de llegada, verificación y entrega.", "One signed, revocable link that unifies the arrival, verification, and handoff experience.")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/demo"
              className="w-full sm:w-auto px-8 py-4 font-semibold text-center transition-opacity hover:opacity-90 min-h-[44px] flex items-center justify-center"
              style={{ backgroundColor: beacon, color: ink }}
            >
              {copy(locale, "Probar la demostración", "Try the demo")}
            </Link>
            <Link
              href="/start"
              className="w-full sm:w-auto px-8 py-4 font-semibold text-center transition-colors hover:bg-white/5 min-h-[44px] flex items-center justify-center"
              style={{ border: `1px solid ${hairline}`, color: paper }}
            >
              {copy(locale, "Empezar", "Get started")}
            </Link>
          </motion.div>
        </section>

        {/* Section 2: How it works */}
        <section className="w-full py-24 px-4 sm:px-6" style={{ borderTop: `1px solid ${hairline}`, backgroundColor: "#060A10" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-16 text-center">
              {copy(locale, "Cómo funciona", "How it works")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-0 right-0 h-[1px]" style={{ backgroundColor: hairline }} />
              
              {[
                { step: "01", title: copy(locale, "Escanear / Tocar", "Scan / Tap"), desc: copy(locale, "QR o etiqueta NDEF", "QR or NDEF tag") },
                { step: "02", title: copy(locale, "Verificar", "Verify"), desc: copy(locale, "El resolver firmado verifica", "Signed resolver verifies") },
                { step: "03", title: copy(locale, "Llegar", "Arrive"), desc: copy(locale, "Guía de llegada HostCasa", "HostCasa arrival guide") },
                { step: "04", title: copy(locale, "Entregar", "Handoff"), desc: copy(locale, "Entrega de prueba Folios", "Folios proof handoff") }
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.48, delay: i * 0.1 }}
                  className="relative z-10 flex flex-col items-center text-center pt-8 md:pt-0"
                >
                  <div className="w-24 h-24 flex items-center justify-center mb-6 font-mono text-2xl font-bold rounded-none" style={{ backgroundColor: ink, color: trace, border: `1px solid ${hairline}` }}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: paper }}>{item.title}</h3>
                  <p style={{ color: trace }}>{item.desc}</p>
                  {item.step === "02" && (
                    <span className="mt-4 text-xs font-semibold px-2 py-1 uppercase tracking-wider" style={{ color: beacon, border: `1px solid ${beacon}` }}>
                      {copy(locale, "Verificado en servidor", "Server-verified")}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Capability matrix */}
        <section className="w-full py-24 px-4 sm:px-6" style={{ borderTop: `1px solid ${hairline}` }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">
              {copy(locale, "Matriz de capacidades", "Capability matrix")}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ borderBottom: `2px solid ${hairline}` }}>
                    <th className="py-4 px-4 font-semibold">{copy(locale, "Superficie", "Surface")}</th>
                    <th className="py-4 px-4 font-semibold">{copy(locale, "Estado", "Status")}</th>
                    <th className="py-4 px-4 font-semibold">{copy(locale, "Nota", "Note")}</th>
                  </tr>
                </thead>
                <tbody className="text-sm sm:text-base">
                  {[
                    { surface: "QR code", status: "Live", statusColor: beacon, note: copy(locale, "Firmado en servidor, de corta duración, revocable", "Server-signed, short-lived, revocable") },
                    { surface: "NDEF NFC", status: "Live", statusColor: beacon, note: copy(locale, "Misma URL que QR — escribir en cualquier etiqueta NDEF", "Same URL as QR — write to any NDEF tag") },
                    { surface: "HostCasa arrival", status: "Live", statusColor: beacon, note: copy(locale, "Guía móvil bilingüe", "Bilingual mobile guide") },
                    { surface: "Folios handoff", status: "Live", statusColor: beacon, note: copy(locale, "Prueba → revisión → ciclo de vida emitido", "Proof → review → issued lifecycle") },
                    { surface: "Apple Wallet", status: "Requires config", statusColor: amber, note: copy(locale, "Activo solo cuando se configura un certificado de Pass Type ID", "Active only when a Pass Type ID certificate is configured") },
                    { surface: "Google Wallet", status: "Requires config", statusColor: amber, note: copy(locale, "Restringido por credencial; necesita emisor + clave de cuenta de servicio", "Credential-gated; needs issuer + service-account key") },
                    { surface: "Smart lock", status: "External", statusColor: trace, note: copy(locale, "Adaptador de proveedor; ningún secreto de puerta en QR/NFC/Wallet", "Provider adapter; no door secret ever in QR/NFC/Wallet") }
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${hairline}` }}>
                      <td className="py-5 px-4 font-medium">{row.surface}</td>
                      <td className="py-5 px-4">
                        <span className="font-semibold text-xs uppercase tracking-wider" style={{ color: row.statusColor }}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-5 px-4" style={{ color: trace }}>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 4: Open-source core */}
        <section className="w-full py-24 px-4 sm:px-6 text-center" style={{ borderTop: `1px solid ${hairline}`, backgroundColor: "#060A10" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              {copy(locale, "Núcleo de código abierto", "Open-source core")}
            </h2>
            <p className="text-lg mb-10" style={{ color: trace }}>
              {copy(locale, "El núcleo es gratuito y con licencia MIT. Implementación, alojamiento administrado, operaciones de Wallet y más están disponibles.", "The core is free and MIT licensed. Implementation, managed hosting, Wallet operations, and more are available.")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/pricing" className="px-6 py-3 font-semibold min-h-[44px] flex items-center justify-center transition-colors hover:bg-white/5" style={{ border: `1px solid ${hairline}` }}>
                {copy(locale, "Ver precios", "View pricing")}
              </Link>
              <a href="https://github.com/FriskyDevelopments/open-stay-pass" target="_blank" rel="noreferrer" className="px-6 py-3 font-semibold min-h-[44px] flex items-center justify-center transition-colors hover:bg-white/5" style={{ border: `1px solid ${hairline}` }}>
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Section 5: Demo CTA */}
        <section className="w-full py-32 px-4 sm:px-6 text-center" style={{ backgroundColor: beacon, color: ink }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              {copy(locale, "Vea el ciclo de vida completo de la credencial", "See the full credential lifecycle")}
            </h2>
            <p className="text-xl mb-10 opacity-90">
              {copy(locale, "Sin necesidad de iniciar sesión. Experimente el escaneo, la resolución y la entrega como lo haría un huésped y un operador.", "No login required. Experience the scan, resolution, and handoff just as a guest and operator would.")}
            </p>
            <Link href="/demo" className="inline-flex px-8 py-4 font-bold min-h-[44px] items-center justify-center transition-opacity hover:opacity-90" style={{ backgroundColor: ink, color: paper }}>
              {copy(locale, "Iniciar demostración", "Start demo")}
            </Link>
          </div>
        </section>

        {/* Section 6: Contact CTA */}
        <section className="w-full py-24 px-4 sm:px-6 text-center" style={{ borderTop: `1px solid ${hairline}` }}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              {copy(locale, "¿Listo para trabajar con nosotros?", "Ready to work with us?")}
            </h2>
            <p className="mb-10 text-lg" style={{ color: trace }}>
              {copy(locale, "Consultas de implementación calificada y conectores para operadores empresariales.", "Qualified implementation and connector inquiries for enterprise operators.")}
            </p>
            <Link href="/contact" className="inline-flex px-8 py-4 font-semibold min-h-[44px] items-center justify-center transition-colors hover:bg-white/5" style={{ border: `1px solid ${beacon}`, color: beacon }}>
              {copy(locale, "Contactar equipo de ventas", "Contact sales")}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
