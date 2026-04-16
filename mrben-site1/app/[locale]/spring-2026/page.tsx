"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Phone, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { BRAND } from "@/app/lib/constants";
import { toMailto, formatPhoneNumber } from "@/app/lib/utils";

/**
 * Spring 2026 VIP Landing Page
 * Simplified, one-page, no scrolling on desktop.
 */

const i18n = {
  fr: {
    pageTitle: "Réservation VIP Printemps 2026",
    subtitle: "Merci de votre fidélité ! Réservez votre entretien printanier en quelques secondes.",
    name: "Nom complet",
    phone: "Téléphone",
    email: "Courriel",
    address: "Adresse",
    choose: "Services requis",
    services: ["Lavage de vitres", "Nettoyage de gouttières", "Lavage de revêtement"],
    desc: "Détails ou demandes spéciales",
    descPlaceholder: "Ex: Même chose que l'an dernier, merci !",
    send: "Confirmer ma réservation",
    sending: "Envoi en cours...",
    sendSuccess: "Demande reçue ! Nous vous contacterons sous peu pour confirmer la date.",
    sendError: "Une erreur s'est produite. Veuillez réessayer ou nous appeler.",
    networkError: "Erreur de connexion. Veuillez vérifier votre internet.",
  },
  en: {
    pageTitle: "Spring 2026 VIP Booking",
    subtitle: "Thank you for your loyalty ! Book your spring maintenance in seconds.",
    name: "Full Name",
    phone: "Phone",
    email: "Email",
    address: "Property Address",
    choose: "Services needed",
    services: ["Window cleaning", "Gutter cleaning", "Siding wash"],
    desc: "Details or special requests",
    descPlaceholder: "Ex: Same as last year, thanks !",
    send: "Confirm my booking",
    sending: "Sending...",
    sendSuccess: "Request received ! We'll contact you shortly to confirm the date.",
    sendError: "An error occurred. Please try again or call us.",
    networkError: "Network error. Please check your connection.",
  }
};

function Input({ label, inputRef, ...inputProps }: { label: string, inputRef?: React.RefObject<HTMLInputElement | null>, [key: string]: any }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-zinc-900">{label}</div>
      <input
        ref={inputRef}
        {...inputProps}
        className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:bg-white"
      />
    </label>
  );
}

function SpringPromoContent({ locale }: { locale: "en" | "fr" }) {
  const t = (k: keyof typeof i18n.fr) => i18n[locale][k] || i18n.fr[k] || k;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    message: "",
  });
  const [services, setServices] = useState<string[]>([]);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const addressInputRef = useRef<HTMLInputElement | null>(null);

  // Load Google Places for address autocomplete
  useEffect(() => {
    let isMounted = true;
    import("@/app/lib/googlePlacesLoader").then(({ loadGooglePlaces }) => {
      loadGooglePlaces().then(() => {
        if (!isMounted || !addressInputRef.current) return;
        const googleMaps = (window as any).google;
        if (!googleMaps?.maps?.places) return;
        
        const autocomplete = new googleMaps.maps.places.Autocomplete(
          addressInputRef.current,
          { types: ["address"], componentRestrictions: { country: "ca" } }
        );

        autocomplete.setFields?.(["formatted_address"]);
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace?.();
          const formatted = place?.formatted_address;
          if (formatted) setForm((prev) => ({ ...prev, address: formatted }));
        });
      });
    });
    return () => { isMounted = false; };
  }, []);

  function toggleService(label: string) {
    setServices((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ state: "sending", message: "" });

    try {
      const contactRef = `SPRING26-${Date.now().toString(36).toUpperCase()}`;
      
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("address", form.address);
      formData.append("services", JSON.stringify(services));
      formData.append("message", form.message);
      formData.append("contactRef", contactRef);
      formData.append("campaign", "Spring 2026 VIP");

      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setStatus({ state: "error", message: data?.error || t("sendError") });
        return;
      }

      // Save lead to drive
      try {
        const leadData = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          referenceId: contactRef,
          service: services.length ? services.join(", ") : "(none selected)",
          vipCampaign: "Spring 2026",
        };
        await fetch("/api/save-lead-to-drive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData)
        });
      } catch (err) {
        console.warn("Failed to save lead to drive", err);
      }

      setStatus({ state: "success", message: t("sendSuccess") as string });
      setForm({ name: "", phone: "", email: "", address: "", message: "" });
      setServices([]);

      // Confetti
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    } catch (error) {
      console.error("Form error:", error);
      setStatus({ state: "error", message: t("networkError") as string });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white flex flex-col justify-center py-6 sm:py-12">
      {/* Hide global header/footer for standalone landing page feel */}
      <style dangerouslySetInnerHTML={{ __html: `header, footer { display: none !important; }` }} />
      
      <div className="mx-auto w-full max-w-4xl px-4">
        
        {/* Header Area */}
        <div className="text-center mb-6 sm:mb-10">
          <Image 
            src="/mrben-logo-transparent (2).png" 
            alt="MrBen.ca" 
            width={120} 
            height={40} 
            className="mx-auto drop-shadow-sm"
          />
          <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            {t("pageTitle")}
          </h1>
          <p className="mt-2 text-sm sm:text-lg text-zinc-600 max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5">
            
            {/* Form Section */}
            <div className="p-6 sm:p-10 md:col-span-3">
              <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label={t("name") as string} placeholder="" required value={form.name} onChange={(e: any) => setForm(p => ({ ...p, name: e.target.value }))} />
                  <Input label={t("phone") as string} placeholder="" required type="tel" value={form.phone} onChange={(e: any) => setForm(p => ({ ...p, phone: formatPhoneNumber(e.target.value) }))} />
                  <Input label={t("email") as string} placeholder="" type="email" value={form.email} onChange={(e: any) => setForm(p => ({ ...p, email: e.target.value }))} />
                  <Input label={t("address") as string} placeholder="" required inputRef={addressInputRef} value={form.address} onChange={(e: any) => setForm(p => ({ ...p, address: e.target.value }))} />
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold text-zinc-900">{t("choose") as string}</div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(i18n[locale].services as string[]).map((serviceName) => (
                      <label key={serviceName} className="flex items-start gap-2 rounded-xl border border-zinc-200 p-3 cursor-pointer hover:bg-zinc-50 transition-colors">
                        <input type="checkbox" className="mt-0.5 accent-zinc-900" checked={services.includes(serviceName)} onChange={() => toggleService(serviceName)} />
                        <span className="text-xs sm:text-sm font-medium text-zinc-800 leading-snug">{serviceName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold text-zinc-900">{t("desc") as string}</div>
                  <textarea 
                    rows={2} 
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:bg-white" 
                    placeholder={t("descPlaceholder") as string} 
                    value={form.message} 
                    onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} 
                  />
                </div>

                {status.state !== "idle" && (
                  <div className={`mt-4 rounded-xl p-3 text-sm font-medium ${status.state === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : status.state === "error" ? "bg-red-50 text-red-800 border border-red-200" : "bg-zinc-50 text-zinc-800"}`}>
                    {status.state === "sending" ? t("sending") : status.message}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={status.state === "sending"} 
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6AC126] px-8 py-4 text-lg font-extrabold text-white shadow-lg shadow-[#6AC126]/30 hover:bg-[#52961D] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {status.state === "sending" ? t("sending") : t("send")} <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Side Info Section */}
            <div className="bg-zinc-950 p-6 sm:p-10 md:col-span-2 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#6AC126]/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#6AC126]/20 px-3 py-1 text-xs font-bold text-[#6AC126] ring-1 ring-[#6AC126]/30 mb-6">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>VIP CLIENT</span>
                </div>
                <h3 className="text-2xl font-bold mb-6">
                  {locale === "fr" ? "Besoin d'aide ?" : "Need help?"}
                </h3>
                <div className="space-y-5">
                  <a href={BRAND.phoneHref} className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 group-hover:bg-[#6AC126] group-hover:ring-[#6AC126] transition-all">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t("phone")}</div>
                      <span className="font-semibold">{BRAND.phoneDisplay}</span>
                    </div>
                  </a>
                  <a href={toMailto(BRAND.emailHref)} className="flex items-center gap-4 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 group-hover:bg-[#6AC126] group-hover:ring-[#6AC126] transition-all">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{t("email")}</div>
                      <span className="font-semibold">{BRAND.email}</span>
                    </div>
                  </a>
                </div>
              </div>
              
              <div className="mt-12 text-xs text-zinc-500 relative z-10">
                &copy; 2026 MrBen.ca.<br />
                {locale === "fr" ? "Service d'entretien professionnel." : "Professional maintenance service."}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpringCampaignPage() {
  const params = useParams();
  const locale = (params?.locale as "en" | "fr") || "fr";

  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center">Loading...</div>}>
      <SpringPromoContent locale={locale} />
    </Suspense>
  );
}
