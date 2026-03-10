"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Phone, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { classNames } from "@/app/lib/utils";
import { BRAND } from "@/app/lib/constants";
import { useGoogleBusinessProfile } from "@/app/hooks/useGoogleBusinessProfile";

import Hero from "./home/LevisHero";
import Services from "./home/Services";
import Pricing from "./home/Pricing";
import Gallery from "./home/Gallery";
import Reviews from "./home/Reviews";
import ServiceArea from "./home/LevisServiceArea";
import Contact from "./home/Contact";

export default function LevisRedesignPreview({ 
  sourceOfTruth,
  phoneNumber = BRAND.phoneDisplay,
  phoneHref = BRAND.phoneHref
}: { 
  sourceOfTruth?: string,
  phoneNumber?: string,
  phoneHref?: string
}) {
  const t = useTranslations('MrBenRedesignPreview');
  const googleProfile = useGoogleBusinessProfile('levis');
  
  const heroRef = useRef<HTMLElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const [isContactInView, setIsContactInView] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const scrollToContact = useCallback(() => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const contactElement = contactRef.current;
    if (!contactElement) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsContactInView(entry.isIntersecting);
      },
      { rootMargin: "0px 0px 40% 0px", threshold: 0 }
    );

    observer.observe(contactElement);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!(target instanceof HTMLElement)) return;
      const tag = target.tagName.toLowerCase();
      const isField =
        ["input", "textarea", "select"].includes(tag) || target.isContentEditable;
      if (isField) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = () => {
      window.setTimeout(() => {
        const active = document.activeElement;
        if (!(active instanceof HTMLElement)) {
          setIsInputFocused(false);
          return;
        }
        const tag = active.tagName.toLowerCase();
        const isField =
          ["input", "textarea", "select"].includes(tag) || active.isContentEditable;
        setIsInputFocused(isField);
      }, 0);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const showStickyCTA = !isContactInView && !isInputFocused;

  return (
    <div className="relative min-h-screen bg-white text-zinc-900">
      <div className="relative z-10">
        <Hero 
          sourceOfTruth={sourceOfTruth} 
          googleProfile={googleProfile}
          phoneNumber={phoneNumber}
          phoneHref={phoneHref}
          onQuote={scrollToContact} 
          t={t} 
          heroRef={heroRef} 
        />        <Services onQuote={scrollToContact} t={t} />
        <Pricing onQuote={scrollToContact} t={t} />
        <Gallery t={t} />
        <Reviews 
          t={t} 
          onQuote={scrollToContact} 
          googleProfile={googleProfile}
          hideReviewCount={true}
        />
        <ServiceArea 
          t={t} 
          googleProfile={googleProfile}
        />
        <Contact 
          t={t} 
          contactRef={contactRef} 
          phoneNumber={phoneNumber}
          phoneHref={phoneHref}
        />
        <div aria-hidden="true" className="h-20 md:hidden" />
      </div>
      <div
        className={classNames(
          "fixed inset-x-0 bottom-0 z-40 md:hidden transition duration-300 ease-out",
          showStickyCTA ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
        aria-hidden={!showStickyCTA}
      >
        <div
          className="mx-auto flex max-w-6xl items-center justify-center gap-3 border-t border-zinc-200 bg-white/95 px-4 pt-3 backdrop-blur"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
        >
          <button
            type="button"
            onClick={scrollToContact}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
          >
            {t("primaryCTA")} <ArrowRight className="h-4 w-4" />
          </button>
          <a
            href={phoneHref}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50"
          >
            <Phone className="h-4 w-4" />
            {t("fastQuoteCall")}
          </a>
        </div>
      </div>
    </div>
  );
}
