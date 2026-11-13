import React, { useState, useEffect } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Locale } from "@/lib/locale";
import { applyRouteMeta } from "@/lib/routeMeta";

export default function SecurityPage() {
  const [locale] = useState<Locale>("en");

  useEffect(() => {
    applyRouteMeta("/security");
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1018] font-sans flex flex-col">
      <SiteNav locale={locale} setLocale={() => {}} />
      
      <main className="flex-grow max-w-[720px] mx-auto w-full px-6 py-16 text-[#F2F0E9]">
        <h1 className="text-3xl md:text-5xl font-bold mb-12">
          Security Policy
        </h1>

        <div className="space-y-12 text-[#93A0AD] leading-[1.75]">
          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Reporting vulnerabilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Do not report vulnerabilities in public issues.</li>
              <li>Email the repository maintainer through the private contact channel listed in the deployed application.</li>
              <li>Include: affected route or component, reproduction steps, expected security boundary, observed behavior, and any safe proof of concept.</li>
              <li>Do NOT include: production guest data, signed tokens, raw credentials, lock codes, or private keys.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Non-negotiable security boundaries</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Credentials are short-lived and revocable.</li>
              <li>QR, NDEF NFC, Wallet, and client interfaces must NEVER contain a lock secret or permanent authorization.</li>
              <li>Sensitive actions must resolve a credential server-side and enforce: signature, scope, expiry, tenant/property relation, and revocation status.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">What the QR code contains</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Only a short-lived signed URL.</li>
              <li>Never: a lock PIN, BLE key, raw access token, payment data, or permanent authorization.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Adapter contracts</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Smart-lock provisioning stays with the access provider.</li>
              <li>The open-source adapter contract documents the interface boundary.</li>
            </ul>
          </section>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
