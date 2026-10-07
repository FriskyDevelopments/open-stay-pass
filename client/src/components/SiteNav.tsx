import { useState } from "react";
import { Link, useLocation } from "wouter";
import { copy, type Locale } from "@/lib/locale";
import { LanguageToggle } from "@/components/LanguageToggle";
import { getGitHubRepositoryUrl } from "@/lib/community";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Star } from "lucide-react";

interface SiteNavProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export function SiteNav({ locale, setLocale }: SiteNavProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const repoUrl = getGitHubRepositoryUrl();

  const navLinks = [
    { href: "/", label: copy(locale, "Producto", "Product") },
    { href: "/demo", label: copy(locale, "Demostración", "Demo") },
    { href: "/pricing", label: copy(locale, "Precios", "Pricing") },
    { href: "https://github.com/FriskyDevelopments/open-stay-pass", label: "Docs", external: true },
    { href: "/contact", label: copy(locale, "Contacto", "Contact") }
  ];

  const ink = "#0A1018";
  const paper = "#F2F0E9";
  const beacon = "#4DA6FF";
  const trace = "#93A0AD";
  const hairline = "#1E2A3A";

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-[100] w-full flex flex-col justify-center" style={{ backgroundColor: ink, borderBottom: `1px solid ${hairline}` }}>
      <div className="flex items-center justify-between px-4 sm:px-6 h-[56px] md:h-[64px] max-w-7xl mx-auto w-full">
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-3 min-h-[44px]">
          <svg width="24" height="24" viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M8 44 C 20 8, 36 10, 30 30 C 26 42, 14 46, 15 38 C 16 28, 40 20, 56 26 C 64 29, 70 32, 78 32" stroke={beacon} strokeWidth="3.5" fill="none" />
            <rect x="84" y="27" width="6" height="6" fill={beacon} />
            <rect x="93" y="23" width="5" height="5" fill={beacon} />
            <rect x="101" y="19" width="4" height="4" fill={beacon} />
          </svg>
          <span className="font-semibold text-base sm:text-lg tracking-tight" style={{ color: paper, fontFamily: "Hanken Grotesk" }}>
            Open Stay Pass
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location === link.href && !link.external;
            return link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium transition-colors hover:opacity-80 min-h-[44px] flex items-center"
                style={{ color: trace }}
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium transition-colors min-h-[44px] flex items-center relative"
                style={{ color: isActive ? paper : trace }}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute bottom-[6px] left-0 right-0 h-[2px]"
                    style={{ backgroundColor: beacon }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageToggle locale={locale} onChange={setLocale} />
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium min-h-[44px] px-3 transition-colors hover:bg-white/5"
              style={{ color: paper, border: `1px solid ${hairline}` }}
            >
              <Star size={16} /> Star on GitHub
            </a>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex items-center justify-center w-[44px] h-[44px]"
          aria-label="Toggle menu"
          style={{ color: paper }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: "circOut" }}
            className="md:hidden overflow-hidden border-t"
            style={{ backgroundColor: ink, borderColor: hairline }}
          >
            <nav className="flex flex-col px-4 py-4 gap-2">
              {navLinks.map((link) => {
                const isActive = location === link.href && !link.external;
                return link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-medium flex items-center min-h-[44px]"
                    style={{ color: trace }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium flex items-center min-h-[44px] border-l-2 pl-3"
                    style={{ 
                      color: isActive ? paper : trace,
                      borderColor: isActive ? beacon : "transparent"
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${hairline}` }}>
                <LanguageToggle locale={locale} onChange={setLocale} />
                {repoUrl && (
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium min-h-[44px] px-3"
                    style={{ color: paper, border: `1px solid ${hairline}` }}
                  >
                    <Star size={16} /> Star
                  </a>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
