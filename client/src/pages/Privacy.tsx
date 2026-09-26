import React, { useState, useEffect } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Locale } from "@/lib/locale";
import { applyRouteMeta } from "@/lib/routeMeta";

export default function Privacy() {
  const [locale] = useState<Locale>("en");

  useEffect(() => {
    applyRouteMeta("/privacy");
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1018] font-sans flex flex-col">
      <SiteNav locale={locale} setLocale={() => {}} />
      
      <main className="flex-grow max-w-[720px] mx-auto w-full px-6 py-16 text-[#F2F0E9]">
        <h1 className="text-3xl md:text-5xl font-bold mb-8">
          Privacy Policy
        </h1>

        <div className="border border-[#FFB300] bg-[#FFB300]/10 p-4 mb-12">
          <p className="text-[#FFB300] font-medium">
            Draft — pending legal review. This policy describes our current practices but has not been formally reviewed by legal counsel.
          </p>
        </div>

        <div className="space-y-12 text-[#93A0AD] leading-[1.75]">
          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">What the site collects</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Lead form fields: name, email, organization, property count, interest category, message, and consent timestamp. These are submitted when you fill out the contact form.</li>
              <li>Early-access waitlist: your email address, the page you signed up from, the referring page, and any UTM campaign tags. A salted one-way hash of your IP address is kept only for abuse and rate-limit protection.</li>
              <li>Privacy-friendly analytics: if configured (VITE_ANALYTICS_ENDPOINT set), the site may collect page views and funnel events (demo_start, demo_complete, pricing_view, contact_submit, start_selfhost, waitlist_submit). No personally identifying information is included in analytics events. Analytics are self-hosted (Umami) when enabled.</li>
              <li>No guest data: no guest arrival, proof handoff, or credential data is processed or stored by this marketing site. Guest data belongs to the operator's deployment.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">What we do with it</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact form submissions and waitlist signups are stored in our own database on Cloudflare (D1). We use contact submissions only to respond to your inquiry, and waitlist emails only to tell you when early access opens. Every email we send includes a one-click unsubscribe link.</li>
              <li>We do not sell, share, or trade your contact information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Cookies</h2>
            <p>
              This site does not set tracking cookies. The analytics integration (when enabled) uses cookieless tracking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Your rights</h2>
            <p>
              You may request deletion of your inquiry data by emailing us at the contact address.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Contact</h2>
            <p>
              Questions? Use the <a href="/contact" className="text-[#4DA6FF] hover:underline">contact form</a>.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
