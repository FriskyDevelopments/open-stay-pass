import { Link } from "wouter";
import { copy, type Locale } from "@/lib/locale";

interface SiteFooterProps {
  locale: Locale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const ink = "#0A1018";
  const paper = "#F2F0E9";
  const trace = "#93A0AD";
  const hairline = "#1E2A3A";

  const columns = [
    {
      title: copy(locale, "Producto", "Product"),
      links: [
        { href: "/", label: copy(locale, "Inicio", "Home") },
        { href: "/demo", label: copy(locale, "Demostración", "Demo") },
        { href: "/pricing", label: copy(locale, "Precios", "Pricing") },
        { href: "/press-kit", label: copy(locale, "Kit de prensa", "Press kit") }
      ]
    },
    {
      title: copy(locale, "Desarrolladores", "Developers"),
      links: [
        { href: "https://github.com/FriskyDevelopments/open-stay-pass", label: "GitHub repo", external: true },
        { href: "/start", label: copy(locale, "Empezar", "Get started") },
        { href: "/integrations", label: copy(locale, "Integraciones", "Integrations") }
      ]
    },
    {
      title: copy(locale, "Legal", "Legal"),
      links: [
        { href: "/privacy", label: copy(locale, "Privacidad", "Privacy") },
        { href: "/terms", label: copy(locale, "Términos", "Terms") },
        { href: "/security", label: copy(locale, "Seguridad", "Security") },
        { href: "/license", label: copy(locale, "Licencia", "License") }
      ]
    }
  ];

  return (
    <footer className="w-full pt-16 pb-8" style={{ backgroundColor: ink, borderTop: `1px solid ${hairline}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          <div className="col-span-1">
            <h2 className="font-semibold text-lg mb-4" style={{ color: paper, fontFamily: "Hanken Grotesk" }}>
              Open Stay Pass
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: trace }}>
              {copy(locale, "Credencial de hospitalidad firmada. Licencia MIT.", "Signed hospitality credential. MIT licensed.")}
            </p>
          </div>
          
          {columns.map((col) => (
            <div key={col.title} className="col-span-1">
              <h3 className="font-semibold text-sm mb-4 uppercase tracking-wider" style={{ color: paper, fontFamily: "Hanken Grotesk" }}>
                {col.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: trace }}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: trace }}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4" style={{ borderTop: `1px solid ${hairline}` }}>
          <div className="flex items-center gap-4 text-xs font-medium" style={{ color: trace }}>
            <span>© {new Date().getFullYear()} Frisky Developments LLC</span>
            <span>·</span>
            <a href="https://github.com/FriskyDevelopments/open-stay-pass" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              GitHub
            </a>
            <span>·</span>
            <a href="https://stay-pass-qr-studio.netlify.app" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              QR Studio
            </a>
            <span>·</span>
            <a href="https://staypass.dev" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              staypass.dev
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
