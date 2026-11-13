import React, { useState, useEffect } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { copy, Locale } from "@/lib/locale";
import { applyRouteMeta } from "@/lib/routeMeta";
import { track } from "@/lib/analytics";

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

export default function Contact() {
  const [locale] = useState<Locale>("en");
  
  useEffect(() => {
    applyRouteMeta("/contact");
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    propertyCount: "",
    interest: "",
    message: "",
    consent: false,
    hp: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "not_configured" | "rate_limited" | "error">("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const interest = params.get("interest");
    if (interest) {
      setFormData((prev) => ({ ...prev, interest }));
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.email) {
      newErrors.email = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.propertyCount) newErrors.propertyCount = "Required";
    if (!formData.interest) newErrors.interest = "Required";
    if (formData.message.length > 2000) newErrors.message = "Max 2000 characters";
    if (!formData.consent) newErrors.consent = "Required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok && data.ok) {
        setStatus("success");
        track("contact_submit");
      } else if (res.status === 503 && data.reason === "not_configured") {
        setStatus("not_configured");
      } else if (res.status === 429) {
        setStatus("rate_limited");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const inputClasses = "w-full min-h-[44px] bg-[#0E1620] border border-[#1E2A3A] text-[#F2F0E9] p-3 focus:outline-none focus:border-[#4DA6FF] transition-colors";
  const labelClasses = "block text-sm font-medium text-[#F2F0E9] mb-1";
  const errorClasses = "text-sm text-[#FF5C38] mt-1";

  return (
    <div className="min-h-screen bg-[#0A1018] font-sans flex flex-col">
      <SiteNav locale={locale} setLocale={() => {}} />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-16">
        <h1 className="text-3xl md:text-5xl font-semibold text-[#F2F0E9] mb-12">
          Contact
        </h1>

        {status === "success" ? (
          <div className="p-8 bg-[#0E1620] border border-[#1E2A3A]">
            <p className="text-xl text-[#F2F0E9]">Thank you. We'll be in touch.</p>
          </div>
        ) : status === "not_configured" ? (
          <div className="p-8 bg-[#0E1620] border border-[#1E2A3A]">
            <p className="text-xl text-[#F2F0E9] mb-4">Inquiries aren't connected on this preview yet.</p>
            {contactEmail && (
              <a href={`mailto:${contactEmail}?subject=Open Stay Pass inquiry`} className="text-[#4DA6FF] hover:underline">
                Email us directly
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {(status === "error" || status === "rate_limited") && (
              <div role="alert" className="p-4 bg-[#FF5C38]/10 border border-[#FF5C38] text-[#FF5C38]">
                {status === "rate_limited"
                  ? "Too many submissions from your connection. Please wait a few minutes and try again."
                  : "An error occurred. Please try again."}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="name" className={labelClasses}>Name *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                {errors.name && <p className={errorClasses}>{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>Email *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} required />
                {errors.email && <p className={errorClasses}>{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="organization" className={labelClasses}>Organization</label>
              <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="propertyCount" className={labelClasses}>Property Count *</label>
                <select id="propertyCount" name="propertyCount" value={formData.propertyCount} onChange={handleChange} className={inputClasses} required>
                  <option value="" disabled>Select count</option>
                  <option value="1">1 property</option>
                  <option value="2-5">2–5 properties</option>
                  <option value="6-20">6–20 properties</option>
                  <option value="20+">20+ properties</option>
                </select>
                {errors.propertyCount && <p className={errorClasses}>{errors.propertyCount}</p>}
              </div>

              <div>
                <label htmlFor="interest" className={labelClasses}>Interest *</label>
                <select id="interest" name="interest" value={formData.interest} onChange={handleChange} className={inputClasses} required>
                  <option value="" disabled>Select interest</option>
                  <option value="general">General inquiry</option>
                  <option value="implementation">Implementation sprint</option>
                  <option value="managed">Managed operator workspace</option>
                  <option value="wallet">Wallet operations</option>
                  <option value="connector">Verified connector pack</option>
                  <option value="ai">AI continuity</option>
                  <option value="smartlock">Smart-lock design service</option>
                </select>
                {errors.interest && <p className={errorClasses}>{errors.interest}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="message" className={labelClasses}>Message</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleChange} className={`${inputClasses} min-h-[120px] resize-y`} />
              {errors.message && <p className={errorClasses}>{errors.message}</p>}
            </div>

            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} className="mt-1 h-5 w-5 bg-[#0E1620] border-[#1E2A3A] checked:bg-[#4DA6FF] focus:ring-0 focus:ring-offset-0" required />
                <span className="text-[#F2F0E9] text-sm">I agree that this form data may be used to respond to my inquiry. *</span>
              </label>
              {errors.consent && <p className={errorClasses}>{errors.consent}</p>}
            </div>

            <input type="text" name="hp" value={formData.hp} onChange={handleChange} aria-hidden="true" tabIndex={-1} autoComplete="off" className="hidden" style={{ display: 'none' }} />

            <button type="submit" disabled={status === "loading"} className="w-full md:w-auto min-h-[44px] px-8 py-3 bg-[#4DA6FF] text-[#0A1018] font-medium hover:bg-[#4DA6FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {status === "loading" ? "Submitting..." : "Submit Inquiry"}
            </button>
          </form>
        )}
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
