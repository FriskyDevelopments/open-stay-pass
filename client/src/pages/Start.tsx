import React, { useState, useEffect } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Locale } from "@/lib/locale";
import { applyRouteMeta } from "@/lib/routeMeta";
import { track } from "@/lib/analytics";

export default function Start() {
  const [locale] = useState<Locale>("en");
  const [activeTab, setActiveTab] = useState<"self-host" | "work-with-us">("self-host");

  useEffect(() => {
    applyRouteMeta("/start");
  }, []);

  const handleTabChange = (tab: "self-host" | "work-with-us") => {
    setActiveTab(tab);
    if (tab === "self-host") {
      track("start_selfhost");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1018] font-sans flex flex-col">
      <SiteNav locale={locale} setLocale={() => {}} />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-16 text-[#F2F0E9]">
        <h1 className="text-3xl md:text-5xl font-semibold mb-12">
          Get started
        </h1>

        <div className="flex space-x-4 mb-12 border-b border-[#1E2A3A]">
          <button
            onClick={() => handleTabChange("self-host")}
            className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
              activeTab === "self-host"
                ? "border-[#4DA6FF] text-[#4DA6FF]"
                : "border-transparent text-[#93A0AD] hover:text-[#F2F0E9]"
            }`}
          >
            Self-host
          </button>
          <button
            onClick={() => handleTabChange("work-with-us")}
            className={`pb-4 px-2 font-medium transition-colors border-b-2 ${
              activeTab === "work-with-us"
                ? "border-[#4DA6FF] text-[#4DA6FF]"
                : "border-transparent text-[#93A0AD] hover:text-[#F2F0E9]"
            }`}
          >
            Work with us
          </button>
        </div>

        {activeTab === "self-host" ? (
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4 flex items-center">
                <span className="text-[#93A0AD] mr-4 text-sm font-mono border border-[#1E2A3A] px-2 py-1">01</span>
                Clone and install
              </h2>
              <pre className="bg-[#0E1620] border-l-2 border-[#4DA6FF] p-4 font-mono text-sm text-[#F2F0E9] overflow-x-auto">
                <code>{`git clone https://github.com/FriskyDevelopments/open-stay-pass
cd open-stay-pass
pnpm install --frozen-lockfile`}</code>
              </pre>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4 flex items-center">
                <span className="text-[#93A0AD] mr-4 text-sm font-mono border border-[#1E2A3A] px-2 py-1">02</span>
                Validate
              </h2>
              <pre className="bg-[#0E1620] border-l-2 border-[#4DA6FF] p-4 font-mono text-sm text-[#F2F0E9] overflow-x-auto">
                <code>{`pnpm validate
# Runs: pnpm test && pnpm check && pnpm build
# Expect: all tests pass, TypeScript clean, production build succeeds`}</code>
              </pre>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#4DA6FF] mb-4 flex items-center">
                <span className="text-[#93A0AD] mr-4 text-sm font-mono border border-[#1E2A3A] px-2 py-1">03</span>
                Configure and deploy
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-[#93A0AD] mb-6">
                <li>Configure secrets through your own secret manager (never commit .env files)</li>
                <li>
                  Key env vars to configure (from README and .env.example):
                  <ul className="list-circle pl-6 mt-2 space-y-1 font-mono text-sm">
                    <li>VITE_GITHUB_REPOSITORY_URL: your fork URL</li>
                    <li>VITE_ANALYTICS_ENDPOINT + VITE_ANALYTICS_WEBSITE_ID: optional analytics</li>
                    <li>VITE_SITE_URL: your deployment URL</li>
                    <li>VITE_CONTACT_EMAIL: contact fallback email</li>
                    <li>LEAD_WEBHOOK_URL: for the contact form (Pages Function)</li>
                  </ul>
                </li>
                <li>Deploy to Cloudflare Pages: <code className="bg-[#0E1620] px-1 py-0.5 rounded text-[#4DA6FF] font-mono text-sm">pnpm build:pages</code> produces <code className="bg-[#0E1620] px-1 py-0.5 rounded text-[#4DA6FF] font-mono text-sm">dist/public</code></li>
                <li>See docs/cloudflare-supabase-runbook.md for the full stack</li>
              </ul>
              
              <div className="bg-[#0E1620] p-6 border border-[#1E2A3A]">
                <h3 className="font-bold text-[#F2F0E9] mb-2">Note the limitations honestly:</h3>
                <ul className="list-disc pl-6 space-y-2 text-[#93A0AD]">
                  <li>Apple Wallet requires an official Pass Type ID certificate (separate setup)</li>
                  <li>Google Wallet requires a valid issuer ID and service-account key</li>
                  <li>Smart-lock provisioning stays with the access provider</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <p className="text-lg text-[#93A0AD] leading-[1.75]">
              Our team can handle implementation, managed hosting, Wallet operations, and more.
            </p>
            <a
              href="/contact"
              className="inline-block min-h-[44px] px-8 py-3 bg-[#4DA6FF] text-[#0A1018] font-medium hover:bg-[#4DA6FF]/90 transition-colors"
            >
              Contact us →
            </a>
          </div>
        )}
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
