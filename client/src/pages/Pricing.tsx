import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'wouter';
import { applyRouteMeta } from '@/lib/routeMeta';
import { track } from '@/lib/analytics';
import { copy, type Locale } from '@/lib/locale';
import { getSupportLinks } from '@/lib/community';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { WaitlistBlock } from '@/components/WaitlistBlock';

const ink = "#0A1018";
const paper = "#F2F0E9";
const beacon = "#4DA6FF";
const trace = "#93A0AD";
const hairline = "#1E2A3A";

const tiers = [
  {
    id: 'core',
    title: {
      en: 'Open-source core',
      es: 'Núcleo de código abierto'
    },
    price: {
      en: 'Free (MIT)',
      es: 'Gratis (MIT)'
    },
    description: {
      en: "What's included: Signed QR and NDEF credential, HostCasa arrival, Folios proof handoff, revocation, Apple/Google Wallet adapter contracts. Self-hosted.",
      es: "Qué incluye: Credencial QR y NDEF firmada, llegada HostCasa, entrega de prueba Folios, revocación, contratos de adaptador de Apple/Google Wallet. Autohospedado."
    },
    cta: {
      en: 'Clone and run',
      es: 'Clonar y ejecutar'
    },
    href: '/start',
    prominent: true,
  },
  {
    id: 'implementation',
    title: {
      en: 'Implementation sprint',
      es: 'Sprint de implementación'
    },
    price: {
      en: 'Contact us',
      es: 'Contáctanos'
    },
    description: {
      en: "Launch your first property or evidence workflow. Fixed-scope setup, bilingual configuration, staff handover.",
      es: "Lanza tu primera propiedad o flujo de evidencia. Configuración de alcance fijo, configuración bilingüe, entrega al personal."
    },
    cta: {
      en: 'Inquire',
      es: 'Consultar'
    },
    href: '/contact?interest=implementation',
    prominent: false,
  },
  {
    id: 'managed',
    title: {
      en: 'Managed operator workspace',
      es: 'Espacio de trabajo de operador administrado'
    },
    price: {
      en: 'Contact us',
      es: 'Contáctanos'
    },
    description: {
      en: "Avoid running credentials, updates, and monitoring alone. Managed hosting, backups, observability, operator support.",
      es: "Evita administrar credenciales, actualizaciones y monitoreo solo. Alojamiento administrado, copias de seguridad, observabilidad, soporte al operador."
    },
    cta: {
      en: 'Inquire',
      es: 'Consultar'
    },
    href: '/contact?interest=managed',
    prominent: false,
  },
  {
    id: 'wallet',
    title: {
      en: 'Wallet operations',
      es: 'Operaciones de Wallet'
    },
    price: {
      en: 'Contact us',
      es: 'Contáctanos'
    },
    description: {
      en: "Issue and maintain Apple/Google Wallet passes. Requires your platform credentials and ongoing certificate/key operations.",
      es: "Emite y mantén pases de Apple/Google Wallet. Requiere credenciales de tu plataforma y operaciones continuas de certificados/claves."
    },
    cta: {
      en: 'Inquire',
      es: 'Consultar'
    },
    href: '/contact?interest=wallet',
    prominent: false,
  },
  {
    id: 'connector',
    title: {
      en: 'Verified connector pack',
      es: 'Paquete de conector verificado'
    },
    price: {
      en: 'Contact us',
      es: 'Contáctanos'
    },
    description: {
      en: "Connect a specific PMS, channel manager, or lock provider. Provider-specific adapter, permission review, lifecycle test suite.",
      es: "Conecta un PMS, administrador de canales o proveedor de cerraduras específico. Adaptador específico del proveedor, revisión de permisos, suite de pruebas de ciclo de vida."
    },
    cta: {
      en: 'Inquire',
      es: 'Consultar'
    },
    href: '/contact?interest=connector',
    prominent: false,
  },
  {
    id: 'ai',
    title: {
      en: 'AI continuity',
      es: 'Continuidad de IA'
    },
    price: {
      en: 'Contact us',
      es: 'Contáctanos'
    },
    description: {
      en: "Scale grounded guest answers from approved property content. Usage-metered model access, retrieval controls.",
      es: "Escala respuestas fundamentadas para huéspedes desde contenido aprobado de la propiedad. Acceso a modelos medido por uso, controles de recuperación."
    },
    cta: {
      en: 'Inquire',
      es: 'Consultar'
    },
    href: '/contact?interest=ai',
    prominent: false,
  },
  {
    id: 'smartlock',
    title: {
      en: 'Smart-lock design service',
      es: 'Servicio de diseño de cerradura inteligente'
    },
    price: {
      en: 'Contact us',
      es: 'Contáctanos'
    },
    description: {
      en: "Connect an audited access provider safely. Provider evaluation, access-window design, webhook/audit integration. Lock provisioning stays with the provider — never in QR/NFC/Wallet.",
      es: "Conecta de forma segura a un proveedor de acceso auditado. Evaluación del proveedor, diseño de ventana de acceso, integración de webhook/auditoría. El aprovisionamiento de cerraduras se mantiene en el proveedor — nunca en QR/NFC/Wallet."
    },
    cta: {
      en: 'Inquire',
      es: 'Consultar'
    },
    href: '/contact?interest=smartlock',
    prominent: false,
  }
];

const faqs = [
  {
    q: {
      en: "What is free forever?",
      es: "¿Qué es gratis para siempre?"
    },
    a: {
      en: "The open-source core (MIT license) is free forever. This includes: signed QR credential generation and revocation, NDEF NFC URL export, bilingual HostCasa arrival guide, Folios proof handoff lifecycle, Apple Wallet and Google Wallet adapter contracts (provider credentials required separately), and the smart-lock adapter interface (lock provisioning stays with the provider).",
      es: "El núcleo de código abierto (licencia MIT) es gratis para siempre. Esto incluye: generación y revocación de credenciales QR firmadas, exportación de URL NDEF NFC, guía de llegada bilingüe HostCasa, ciclo de vida de entrega de prueba Folios, contratos de adaptador de Apple Wallet y Google Wallet (se requieren credenciales del proveedor por separado) y la interfaz del adaptador de cerradura inteligente (el aprovisionamiento de cerraduras se mantiene en el proveedor)."
    }
  },
  {
    q: {
      en: "What does Apple Wallet or Google Wallet require?",
      es: "¿Qué requieren Apple Wallet o Google Wallet?"
    },
    a: {
      en: "Apple Wallet pass issuance requires an official Pass Type ID certificate configured by the operator. Google Wallet requires a valid issuer ID and service-account private key with signing privileges. Neither is included in the open-source core. The adapter contracts document what's needed.",
      es: "La emisión de pases de Apple Wallet requiere un certificado oficial de Pass Type ID configurado por el operador. Google Wallet requiere un ID de emisor válido y una clave privada de cuenta de servicio con privilegios de firma. Ninguno está incluido en el núcleo de código abierto. Los contratos del adaptador documentan lo necesario."
    }
  },
  {
    q: {
      en: "Does the QR code or NFC tag contain lock secrets?",
      es: "¿El código QR o la etiqueta NFC contienen secretos de la cerradura?"
    },
    a: {
      en: "No. The QR, NDEF NFC tag, and Wallet barcode contain only the same short-lived signed URL. They never contain a lock PIN, BLE key, raw access token, payment data, or permanent authorization. Lock provisioning stays with the access provider.",
      es: "No. El código QR, la etiqueta NDEF NFC y el código de barras de Wallet contienen solo la misma URL firmada de corta duración. Nunca contienen un PIN de cerradura, una clave BLE, un token de acceso sin procesar, datos de pago ni autorización permanente. El aprovisionamiento de la cerradura se mantiene en el proveedor de acceso."
    }
  },
  {
    q: {
      en: "Can I self-host without paying anything?",
      es: "¿Puedo autohospedar sin pagar nada?"
    },
    a: {
      en: "Yes. Clone the repository, run `pnpm install --frozen-lockfile && pnpm validate`, configure your secrets through your own secret manager, and deploy. The full credential lifecycle works without any commercial agreement.",
      es: "Sí. Clona el repositorio, ejecuta `pnpm install --frozen-lockfile && pnpm validate`, configura tus secretos a través de tu propio administrador de secretos y despliega. El ciclo de vida completo de la credencial funciona sin ningún acuerdo comercial."
    }
  },
  {
    q: {
      en: "What does an implementation sprint include?",
      es: "¿Qué incluye un sprint de implementación?"
    },
    a: {
      en: "A fixed-scope engagement to launch your first property or evidence workflow. Includes bilingual configuration, staff handover, and a validated test run. Scope is agreed before engagement starts.",
      es: "Un compromiso de alcance fijo para lanzar tu primera propiedad o flujo de trabajo de evidencia. Incluye configuración bilingüe, entrega al personal y una prueba de ejecución validada. El alcance se acuerda antes de que comience el compromiso."
    }
  },
  {
    q: {
      en: "Is there lock-in?",
      es: "¿Existe dependencia de proveedor (lock-in)?"
    },
    a: {
      en: "No. The core is MIT licensed. You can fork, self-host, migrate, or stop at any time. Commercial services are optional add-ons, not prerequisites.",
      es: "No. El núcleo tiene licencia MIT. Puedes hacer una bifurcación (fork), autohospedar, migrar o detenerte en cualquier momento. Los servicios comerciales son complementos opcionales, no requisitos previos."
    }
  }
];

export default function Pricing() {
  const [locale, setLocale] = useState<Locale>('en');
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    applyRouteMeta('/pricing');
    track('pricing_view');
  }, []);

  const supportLinks = getSupportLinks();

  return (
    <div style={{ backgroundColor: ink, color: paper, minHeight: '100vh', fontFamily: 'Hanken Grotesk, sans-serif' }}>
      <SiteNav locale={locale} setLocale={setLocale} />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
        <header style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            {copy(locale, "El núcleo de código abierto es gratis. El resto es una conversación.", "Open-source core is free. The rest is a conversation.")}
          </h1>
          <p style={{ fontSize: '1.25rem', color: trace, maxWidth: '800px', margin: '0 auto', lineHeight: 1.5 }}>
            {copy(locale, "Licencia MIT. Clónalo, ejecútalo, valídalo. Cuando estés listo para implementación, operaciones o servicios administrados, estamos aquí.", "MIT licensed. Clone it, run it, validate it. When you're ready for implementation, operations, or managed services, we're here.")}
          </p>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '24px',
          marginBottom: '80px'
        }}>
          {tiers.map((tier, index) => (
            <motion.div 
              key={tier.id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: shouldReduceMotion ? 0 : index * 0.1 }}
              style={{
                border: tier.prominent ? `1px solid ${beacon}` : `1px solid ${hairline}`,
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gridColumn: tier.prominent ? '1 / -1' : 'auto'
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px', color: tier.prominent ? beacon : 'inherit' }}>
                {copy(locale, tier.title.es, tier.title.en)}
              </h2>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>
                {copy(locale, tier.price.es, tier.price.en)}
              </div>
              <p style={{ color: trace, marginBottom: '32px', flexGrow: 1, lineHeight: 1.5 }}>
                {copy(locale, tier.description.es, tier.description.en)}
              </p>
              <Link 
                href={tier.href}
                style={{
                  display: 'inline-block',
                  textAlign: 'center',
                  padding: '12px 24px',
                  backgroundColor: tier.prominent ? beacon : 'transparent',
                  color: tier.prominent ? ink : paper,
                  border: tier.prominent ? 'none' : `1px solid ${hairline}`,
                  textDecoration: 'none',
                  fontWeight: 600,
                  minHeight: '44px',
                  lineHeight: '20px'
                }}
              >
                {copy(locale, tier.cta.es, tier.cta.en)}
              </Link>
            </motion.div>
          ))}
        </div>

        <div style={{ margin: '0 -24px 80px' }}>
          <WaitlistBlock locale={locale} source="pricing" />
        </div>

        <section style={{ marginBottom: '80px', borderTop: `1px solid ${hairline}`, paddingTop: '80px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '40px', textAlign: 'center' }}>
            {copy(locale, "Preguntas frecuentes", "FAQ")}
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>
                  {copy(locale, faq.q.es, faq.q.en)}
                </h3>
                <p style={{ color: trace, lineHeight: 1.6 }}>
                  {copy(locale, faq.a.es, faq.a.en).split('`').map((part, i) => 
                    i % 2 === 1 ? <code key={i} style={{ backgroundColor: hairline, padding: '2px 4px', borderRadius: '2px' }}>{part}</code> : part
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ textAlign: 'center', borderTop: `1px solid ${hairline}`, paddingTop: '80px', paddingBottom: '80px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px' }}>
            {copy(locale, "Soporte comunitario", "Community support")}
          </h2>
          <p style={{ color: trace, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto', lineHeight: 1.5 }}>
            {copy(locale, 
              "Ko-fi, NOWPayments y Wise Business son enlaces de soporte voluntario. No desbloquean funciones ni cambian tu nivel de confianza.", 
              "Ko-fi, NOWPayments, and Wise Business are voluntary support links. They don't unlock features or change your trust level."
            )}
          </p>
          {supportLinks.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {supportLinks.map(link => (
                <a 
                  key={link.id} 
                  href={link.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 24px',
                    border: `1px solid ${hairline}`,
                    color: paper,
                    textDecoration: 'none',
                    fontWeight: 600,
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  {copy(locale, link.label.es, link.label.en)}
                </a>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
