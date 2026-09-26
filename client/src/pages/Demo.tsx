import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { track } from "@/lib/analytics";
import { applyRouteMeta } from "@/lib/routeMeta";
import { type Locale } from "@/lib/locale";
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
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const stepTitles = [
    "Step 1 of 6 — Operator creates a stay",
    "Step 2 of 6 — QR and NDEF URL generated",
    "Step 3 of 6 — Guest arrival view",
    "Step 4 of 6 — Folios CFDI lifecycle",
    "Step 5 of 6 — Revocation",
    "Step 6 of 6 — Complete"
  ];

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div style={{ backgroundColor: "#0A1018", color: "#F2F0E9", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteNav locale={locale} setLocale={setLocale} />
      
      <main style={{ flex: 1, padding: "2rem", maxWidth: "800px", margin: "0 auto", width: "100%", fontFamily: "Hanken Grotesk, sans-serif" }}>
        <div style={{
          border: "1px solid #4DA6FF",
          color: "#93A0AD",
          padding: "1rem",
          marginBottom: "2rem",
          textAlign: "center"
        }}>
          Interactive demo — simulated data. No real credential is issued, no account required.
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{stepTitles[currentStep]}</h1>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={handlePrev} disabled={currentStep === 0} style={{ padding: "0.5rem 1rem", backgroundColor: currentStep === 0 ? "#1E2A3A" : "#4DA6FF", color: currentStep === 0 ? "#93A0AD" : "#0A1018", border: "none", cursor: currentStep === 0 ? "not-allowed" : "pointer" }}>Previous</button>
            <button onClick={handleNext} disabled={currentStep === 5} style={{ padding: "0.5rem 1rem", backgroundColor: currentStep === 5 ? "#1E2A3A" : "#4DA6FF", color: currentStep === 5 ? "#93A0AD" : "#0A1018", border: "none", cursor: currentStep === 5 ? "not-allowed" : "pointer" }}>Next</button>
          </div>
        </div>

        <div style={{ position: "relative", minHeight: "400px", overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.32, ease: "easeInOut" }}
              style={{ position: "absolute", width: "100%" }}
            >
              {currentStep === 0 && (
                <div style={{ padding: "2rem", border: "1px solid #1E2A3A", backgroundColor: "#0A1018" }}>
                  <h2>Create Stay (Simulated)</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                    <div><label style={{ color: "#93A0AD" }}>Property</label><div>La Casa de Barra</div></div>
                    <div><label style={{ color: "#93A0AD" }}>Guest Name</label><div>M. Arriaga</div></div>
                    <div><label style={{ color: "#93A0AD" }}>Check-in</label><div>Tomorrow</div></div>
                    <div><label style={{ color: "#93A0AD" }}>Check-out</label><div>+3 days</div></div>
                  </div>
                  <button onClick={handleNext} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#4DA6FF", color: "#0A1018", border: "none", cursor: "pointer", fontSize: "1rem" }}>Generate credential</button>
                </div>
              )}

              {currentStep === 1 && (
                <div style={{ border: "1px solid #1E2A3A", padding: "2rem" }}>
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
                  <p style={{ color: "#93A0AD", marginTop: "1rem" }}>The tag never contains a lock PIN or door secret.</p>
                </div>
              )}

              {currentStep === 2 && (
                <div style={{ border: "1px solid #1E2A3A", padding: "2rem", backgroundColor: "#F2F0E9", color: "#0A1018" }}>
                  <h2 style={{ margin: "0 0 1rem 0" }}>La Casa de Barra</h2>
                  <p><strong>Check-in instructions:</strong> Lockbox at main gate. Code provided separately by operator.</p>
                  <p><strong>WiFi:</strong> BellaRed — ask operator for password</p>
                  <hr style={{ borderColor: "#BAC0B7", margin: "1rem 0" }} />
                  <h3>House Rules</h3>
                  <ul style={{ paddingLeft: "1.5rem" }}>
                    <li>No smoking indoors</li>
                    <li>Quiet hours 10 PM - 8 AM</li>
                  </ul>
                  <div style={{ marginTop: "2rem" }}>
                    <button onClick={() => setLocale(locale === "en" ? "es" : "en")} style={{ padding: "0.5rem", border: "1px solid #0A1018", backgroundColor: "transparent", cursor: "pointer" }}>
                      Toggle Language ({locale.toUpperCase()})
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div style={{ border: "1px solid #1E2A3A", padding: "2rem" }}>
                  <p style={{ marginBottom: "2rem" }}>The same credential link reflects the CFDI proof state. Click through the states below to see how it updates in real time.</p>
                  <TicketStatusPreview />
                </div>
              )}

              {currentStep === 4 && (
                <div style={{ border: "1px solid #1E2A3A", padding: "2rem", textAlign: "center" }}>
                  <h2>Revoke Credential</h2>
                  <p style={{ color: "#93A0AD", marginBottom: "2rem" }}>Operator can revoke access at any time.</p>
                  <button onClick={handleNext} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#FF5C38", color: "#0A1018", border: "none", cursor: "pointer", fontSize: "1rem" }}>Revoke credential</button>
                </div>
              )}

              {currentStep === 5 && (
                <div style={{ border: "1px solid #1E2A3A", padding: "2rem", textAlign: "center" }}>
                  <h2 style={{ color: "#FF5C38" }}>Revoked</h2>
                  <p style={{ marginBottom: "2rem", color: "#93A0AD" }}>The signed resolver confirms revocation. The guest cannot use this link.</p>
                  <a href="https://staypass-pmz7aqns.manus.space" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.75rem 1.5rem", backgroundColor: "#4DA6FF", color: "#0A1018", textDecoration: "none" }}>
                    Try the live MVP
                  </a>
                  <p style={{ marginTop: "1rem", color: "#93A0AD" }}>For the real operator flow, open the live MVP.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
