import React, { useState, useEffect } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Locale } from "@/lib/locale";
import { applyRouteMeta } from "@/lib/routeMeta";

export default function Terms() {
  const [locale] = useState<Locale>("en");

  useEffect(() => {
    applyRouteMeta("/terms");
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1018] font-sans flex flex-col">
      <SiteNav locale={locale} setLocale={() => {}} />
      
      <main className="flex-grow max-w-[720px] mx-auto w-full px-6 py-16 text-[#F2F0E9]">
        <h1 className="text-3xl md:text-5xl font-bold mb-8">
          Terms of Service
        </h1>

        <div className="border border-[#FFB300] bg-[#FFB300]/10 p-4 mb-12">
          <p className="text-[#FFB300] font-medium">
            Draft — pending legal review. This policy describes our current practices but has not been formally reviewed by legal counsel.
          </p>
        </div>

        <div className="space-y-12 text-[#93A0AD] leading-[1.75]">
          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Use of this site</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>This is the marketing and documentation site for Open Stay Pass, an MIT-licensed open-source project by Frisky Developments LLC.</li>
              <li>The site is provided "as is" without warranty.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Open Stay Pass software</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The software is MIT licensed. See the <a href="/license" className="text-[#4DA6FF] hover:underline">License page</a>.</li>
              <li>The software is provided without warranty of any kind.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Contact and lead form</h2>
            <p>
              Submitting the contact form is not a contract. It initiates an inquiry that our team may or may not respond to.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Third-party integrations</h2>
            <p>
              Links to GitHub, the live MVP (<a href="https://staypass-pmz7aqns.manus.space" className="text-[#4DA6FF] hover:underline" target="_blank" rel="noopener noreferrer">https://staypass-pmz7aqns.manus.space</a>), and the community QR Studio are provided for reference. We are not responsible for third-party sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4">Changes</h2>
            <p>
              We may update these terms. Material changes will be noted here.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
