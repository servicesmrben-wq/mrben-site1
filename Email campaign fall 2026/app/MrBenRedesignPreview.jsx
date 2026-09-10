"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  Star,
  Languages,
} from "lucide-react";

/**
 * MrBen.ca — Fall 2026 Campaign Web Preview
 * Bilingual (FR/EN) with seasonal autumn messaging & visuals.
 */

const BRAND = {
  name: "MrBen.ca",
  phoneDisplay: "514-699-7145",
  phoneHref: "tel:+15146997145",
  email: "service@mrben.ca",
  emailHref: "mailto:service@mrben.ca",
};

const SERVICE_AREAS = [
  "Hawkesbury",
  "Lachute",
  "St-Sauveur",
  "St-Jérôme",
  "Mirabel",
  "Blainville",
  "St-Eustache",
  "Laval",
  "et villes avoisinantes",
];

const IMAGE_URLS = [
  "/hero_fall.png",
  "/fall_window_cleaning.png",
  "/fall_gutter_cleaning.png",
];

const i18n = {
  fr: {
    langShort: "FR",
    langLabel: "Français",
    toggleTo: "EN",
    topTagline: "Estimation gratuite • Service d'automne courtois & ponctuel",

    navServices: "Services d'automne",
    navGallery: "Réalisations",
    navReviews: "Avis",
    navTerritory: "Territoire",
    navContact: "Contact",
    navCall: "Appeler",
    navOnline: "Demande en ligne",
    navSub: "Gouttières • Vitres • Pression",

    heroBadgeA: "Spécial Pré-Hiver 2026",
    heroBadgeB: "Laurentides & environs",
    heroH1a: "Préparez votre maison pour l'hiver.",
    heroH1b: "Vidange de gouttières & vitres impeccables.",
    heroP:
      "Équipe attentionnée et expérimentée — protégez votre demeure contre le gel et les débris avant la première neige.",
    heroCTA: "Rendez-vous d'automne",
    heroStat1T: "Protection hivernale",
    heroStat1S: "Gouttières dégagées",
    heroStat2T: "Ponctuel",
    heroStat2S: "Service rapide",
    heroStat3T: "Finition pro",
    heroStat3S: "Vitres sans traces",

    secServicesK: "Entretien d'automne",
    secServicesT: "Services de saison",
    secServicesS: "Dégagement des débris, lavage de vitres et entretien pré-hivernal.",

    serviceVitresT: "Lavage de vitres",
    serviceVitresD:
      "Profitez d'une clarté maximale durant l'automne. Nettoyage intérieur/extérieur, cadrages et moustiquaires.",
    serviceVitresH: "À partir de 165$",
    serviceVitresB1: "Résidentiel & commercial",
    serviceVitresB2: "Transparence parfaite",
    serviceVitresB3: "Finition sans traces",

    serviceGoutT: "Vidange de gouttières",
    serviceGoutD:
      "Retrait des feuilles mortes et débris pour éviter les infiltrations d'eau et le gel hivernal.",
    serviceGoutH: "Essentiel en automne",
    serviceGoutB1: "Nettoyage complet des conduits",
    serviceGoutB2: "Vérification des descentes",
    serviceGoutB3: "Prévention des dommages",

    servicePressT: "Nettoyage extérieur",
    servicePressD:
      "Lavage haute pression du revêtement, terrasses et allées avant la saison froide.",
    servicePressH: "Éclat durable",
    servicePressB1: "Revêtement & béton",
    servicePressB2: "Patios & allées",
    servicePressB3: "Protection longue durée",

    serviceCTA: "Demander une soumission",

    fastQuoteT: "Estimation rapide par photo",
    fastQuoteP:
      "Envoyez quelques photos de votre maison par courriel pour recevoir une soumission rapide.",
    fastQuoteEmail: "Envoyer un courriel",
    fastQuoteCall: "Appeler maintenant",

    secGalK: "Galerie d'Automne",
    secGalT: "Nos Réalisations",
    secGalS: "Aperçu de nos travaux d'entretien d'automne dans votre secteur.",

    secRevK: "Avis Clients",
    secRevT: "Ce que disent nos clients",
    secRevS: "La satisfaction de nos clients est notre plus grande fierté.",

    secAreaK: "Territoire",
    secAreaT: "Secteurs desservis cet automne",
    secAreaS: "Nous nous déplaçons rapidement dans toutes les Laurentides et villes environnantes.",

    contactK: "Soumission Gratuite",
    contactT: "Réservez votre plage d'automne",
    contactP:
      "Les places pour la saison d'automne se remplissent vite. Contactez-nous dès aujourd'hui !",
  },
  en: {
    langShort: "EN",
    langLabel: "English",
    toggleTo: "FR",
    topTagline: "Free estimate • Courteous & punctual autumn service",

    navServices: "Fall Services",
    navGallery: "Work",
    navReviews: "Reviews",
    navTerritory: "Area",
    navContact: "Contact",
    navCall: "Call",
    navOnline: "Online request",
    navSub: "Gutters • Windows • Pressure",

    heroBadgeA: "Pre-Winter Special 2026",
    heroBadgeB: "Laurentians & nearby",
    heroH1a: "Prepare your home for winter.",
    heroH1b: "Gutter clearing & spotless windows.",
    heroP:
      "Caring & experienced team — safeguard your house from debris and freeze before winter arrives.",
    heroCTA: "Book Fall Appointment",
    heroStat1T: "Winter Protection",
    heroStat1S: "Clear debris & gutters",
    heroStat2T: "On-Time",
    heroStat2S: "Fast turnaround",
    heroStat3T: "Pro Finish",
    heroStat3S: "Streak-free windows",

    secServicesK: "Autumn Care",
    secServicesT: "Seasonal Services",
    secServicesS: "Debris removal, window washing, and pre-winter home preparation.",

    serviceVitresT: "Window Cleaning",
    serviceVitresD:
      "Maximize natural autumn light. Interior/exterior cleaning, frames, and screen care.",
    serviceVitresH: "From $165",
    serviceVitresB1: "Residential & commercial",
    serviceVitresB2: "Maximum clarity",
    serviceVitresB3: "Streak-free finish",

    serviceGoutT: "Gutter Cleaning",
    serviceGoutD:
      "Clear fallen leaves and debris to prevent water backups and winter ice dams.",
    serviceGoutH: "Fall Essential",
    serviceGoutB1: "Complete gutter flush",
    serviceGoutB2: "Downspout check",
    serviceGoutB3: "Freeze damage prevention",

    servicePressT: "Exterior Power Wash",
    servicePressD:
      "Pressure washing for siding, decks, and driveways before winter weather hits.",
    servicePressH: "Lasting Shine",
    servicePressB1: "Siding & concrete",
    servicePressB2: "Decks & driveways",
    servicePressB3: "Long-term protection",

    serviceCTA: "Request a quote",

    fastQuoteT: "Fast Photo Estimate",
    fastQuoteP:
      "Email us a few photos of your property for a swift and convenient estimate.",
    fastQuoteEmail: "Email us",
    fastQuoteCall: "Call now",

    secGalK: "Fall Gallery",
    secGalT: "Recent Projects",
    secGalS: "A showcase of our autumn home maintenance work across the region.",

    secRevK: "Client Reviews",
    secRevT: "What clients say",
    secRevS: "Delivering top satisfaction to property owners every autumn.",

    secAreaK: "Service Area",
    secAreaT: "Cities served this fall",
    secAreaS: "Prompt service throughout the Laurentians and surrounding areas.",

    contactK: "Free Estimate",
    contactT: "Reserve your fall slot",
    contactP:
      "Autumn booking slots fill up quickly ahead of winter. Contact us today!",
  },
};

function useI18n(lang) {
  const dict = i18n[lang] || i18n.fr;
  return (k) => dict[k] ?? k;
}

export default function MrBenRedesignPreview() {
  const [lang, setLang] = useState("fr");
  const t = useI18n(lang);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Bar */}
      <div className="hidden border-b border-zinc-200 bg-white/80 backdrop-blur md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-sm text-zinc-700">
          <div className="flex items-center gap-5">
            <a className="inline-flex items-center gap-2 hover:text-zinc-900" href={BRAND.phoneHref}>
              <Phone className="h-4 w-4" /> {BRAND.phoneDisplay}
            </a>
            <a className="inline-flex items-center gap-2 hover:text-zinc-900" href={BRAND.emailHref}>
              <Mail className="h-4 w-4" /> {BRAND.email}
            </a>
          </div>
          <div>{t("topTagline")}</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white font-bold text-sm">
              MB
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900">{BRAND.name}</div>
              <div className="text-xs text-zinc-500">{t("navSub")}</div>
            </div>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50"
            >
              <Languages className="h-4 w-4" /> {t("toggleTo")}
            </button>
            <a
              href="https://www.mrben.ca/automne-2026"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
            >
              {t("heroCTA")} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-zinc-950 text-white py-20 px-4">
        <div className="absolute inset-0 opacity-40">
          <img src={IMAGE_URLS[0]} alt="Fall Hero" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-medium text-white ring-1 ring-white/20">
            <Sparkles className="h-3.5 w-3.5" /> {t("heroBadgeA")} &bull; {t("heroBadgeB")}
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("heroH1a")}<br />
            <span className="text-green-400">{t("heroH1b")}</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-300 max-w-2xl mx-auto">{t("heroP")}</p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="https://www.mrben.ca/automne-2026"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-green-700 transition"
            >
              {t("heroCTA")} <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900">{t("secServicesT")}</h2>
          <p className="mt-2 text-zinc-600">{t("secServicesS")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{t("serviceGoutH")}</span>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">{t("serviceGoutT")}</h3>
              <p className="mt-2 text-sm text-zinc-600">{t("serviceGoutD")}</p>
            </div>
            <img src={IMAGE_URLS[2]} alt="Gutter cleaning" className="mt-4 rounded-2xl h-48 w-full object-cover" />
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{t("serviceVitresH")}</span>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">{t("serviceVitresT")}</h3>
              <p className="mt-2 text-sm text-zinc-600">{t("serviceVitresD")}</p>
            </div>
            <img src={IMAGE_URLS[1]} alt="Window cleaning" className="mt-4 rounded-2xl h-48 w-full object-cover" />
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{t("servicePressH")}</span>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">{t("servicePressT")}</h3>
              <p className="mt-2 text-sm text-zinc-600">{t("servicePressD")}</p>
            </div>
            <div className="mt-4 rounded-2xl bg-zinc-900 text-white p-6 text-center flex flex-col justify-center items-center h-48">
              <Shield className="h-10 w-10 text-green-400 mb-2" />
              <div className="font-bold text-lg">Protection Hivernale</div>
              <div className="text-xs text-zinc-400 mt-1">Préservez vos surfaces extérieures</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
