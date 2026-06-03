"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ConsentState {
  accepted: boolean;
}

export default function CookieBanner() {
  const t = useTranslations("cookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given or declined
    const savedConsent = localStorage.getItem("cookie-consent");
    if (!savedConsent) {
      // Small delay for natural fade-in after page load
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateGtagConsent = (granted: boolean) => {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      const state = granted ? "granted" : "denied";
      (window as any).gtag("consent", "update", {
        ad_personalization: state,
        ad_storage: state,
        ad_user_data: state,
        analytics_storage: state,
      });
    }
  };

  const handleAccept = () => {
    const consent: ConsentState = { accepted: true };
    localStorage.setItem("cookie-consent", JSON.stringify(consent));
    updateGtagConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    const consent: ConsentState = { accepted: false };
    localStorage.setItem("cookie-consent", JSON.stringify(consent));
    updateGtagConsent(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[9999] bg-zinc-950/95 backdrop-blur-md border border-zinc-800 text-white rounded-3xl p-6 shadow-2xl transition-all duration-500 ease-out transform ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-base font-bold tracking-tight text-white mb-1">
            {t("title")}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {t("description")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 order-2 sm:order-1 border border-zinc-800 hover:bg-white/10 text-white font-semibold px-4 py-2.5 rounded-2xl text-xs transition-colors text-center cursor-pointer"
          >
            {t("decline")}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 order-1 sm:order-2 bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-4 py-2.5 rounded-2xl text-xs transition-colors text-center cursor-pointer"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
