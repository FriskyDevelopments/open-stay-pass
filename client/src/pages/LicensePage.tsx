import React, { useState, useEffect } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Locale } from "@/lib/locale";
import { applyRouteMeta } from "@/lib/routeMeta";

export default function LicensePage() {
  const [locale] = useState<Locale>("en");

  useEffect(() => {
    applyRouteMeta("/license");
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1018] font-sans flex flex-col">
      <SiteNav locale={locale} setLocale={() => {}} />
      
      <main className="flex-grow max-w-[720px] mx-auto w-full px-6 py-16 text-[#F2F0E9]">
        <h1 className="text-3xl md:text-5xl font-bold mb-8">
          License
        </h1>

        <div className="space-y-8 text-[#93A0AD] leading-[1.75]">
          <p>
            Open Stay Pass is open-source software licensed under the MIT License. You can find the official copy in the <a href="https://github.com/FriskyDevelopments/open-stay-pass" className="text-[#4DA6FF] hover:underline" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
          </p>

          <pre className="bg-[#0E1620] border-l-2 border-[#4DA6FF] p-6 font-mono text-sm text-[#F2F0E9] whitespace-pre-wrap">
{`MIT License

Copyright (c) Frisky Developments LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
          </pre>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
