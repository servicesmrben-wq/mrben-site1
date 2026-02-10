"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Shield,
  Briefcase,
  Clock,
  Sparkles,
  ArrowRight,
  Star,
  X,
} from "lucide-react";
import { CITY_PAGES } from "@/app/territoire/city-data";
import { useLocale } from "./components/LocaleProvider";
import { loadGooglePlaces } from "./lib/googlePlacesLoader";

/**
 * MrBenTest.ca — Modernized Website Preview (single-file)
 *
 * Bilingual (FR/EN) with a language toggle button.
 * Notes:
 * - This is a front-end preview (no server). The form is a UI mock; wire it to email/CRM later.
 * - IMAGE_URLS[0] should be a public path in Next.js (e.g. /images/hero.jpg).
 */

const BRAND = {
  name: "MrBen.ca",
  phoneDisplay: "514-699-7145",
  phoneHref: "tel:+15146997145",
  email: "service@mrben.ca",
  emailHref: "service@mrben.ca",
  googleReviewsUrl: "https://maps.app.goo.gl/tDWmLSud1LPRVFBLA",
};

const toMailto = (href) => {
  if (!href) return href;
  const trimmedHref = href.trim();
  const lowerHref = trimmedHref.toLowerCase();
  if (lowerHref.startsWith("mailto:") || lowerHref.startsWith("http")) return trimmedHref;
  if (!trimmedHref.includes("@")) return trimmedHref;
  return `mailto:${trimmedHref}`;
};

const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
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
];

const IMAGE_URLS = [
  "/hero.jpg",

  "/gallery/lavage-vitres-interieur-detail.jpg",
  "/gallery/lavage-vitres-lachute-avant-apres.jpg",
  "/gallery/lavage-vitres-saint-jerome-residentiel.jpg",
  "/gallery/lavage-pression-beton.jpg",
  "/gallery/nettoyage-gouttieres-maison.jpg",
  "/gallery/lavage-vitres-saint-sauveur-maison.jpg",
  "/gallery/lavage-vitres-mirabel-maison.jpg",
  "/gallery/nettoyage-revetement-exterieur.jpg",
  "/gallery/lavage-vitres-exterieur-maison.jpg",
  "/gallery/lavage-vitres-residentiel-detail.jpg",
  "/gallery/lavage-pression-entree-laval.jpg",
  "/gallery/nettoyage-gouttieres-blainville.jpg",
  "/gallery/lavage-vitres-residentiel-avant-apres.jpg",
];

const i18n = {
  fr: {
    // Global
    langShort: "FR",
    langLabel: "Français",
    toggleTo: "EN",
    topTagline: "Estimation gratuite • Service courtois & ponctuel",
    privacyPolicyLink: "Politique de confidentialité",

    // Nav
    navServices: "Services",
    navGallery: "Réalisations",
    navReviews: "Avis",
    navTerritory: "Territoire",
    navContact: "Contact",
    navCall: "Appeler",
    navOnline: "Obtenir une estimation gratuite",
    navSubTitle: "Nettoyage",
    navSub: "Vitres • Gouttières • Revêtement",

    // Hero
    heroBadgeA: "Résidentiel & commercial",
    heroBadgeB: "Laurentides & environs",
    heroH1a: "Nettoyage de vitres résidentiel et commercial dans les Laurentides",
    heroH1b: "Lachute, Saint-Jérôme, Mirabel et environs",
    heroP:
      "Équipe attentionnée, courtoise — service rapide et soigné pour vous offrir le meilleur rapport qualité-prix.",
    heroCTA: "Obtenir une estimation gratuite",
    primaryCTA: "Obtenir une estimation gratuite",
    ctaReassurance: "Réponse rapide • Aucune obligation",
    heroTrust1: "Google",
    heroTrust2: "Entreprise locale des Laurentides",
    heroTrust3: "Entièrement assuré",
    heroTrust4: "Résidentiel et commercial",
    heroVerifiedByGoogle: "Vérifié sur Google",
    heroLeaveReview: "Laisser un avis Google",
    heroStat1T: "10+ ans",
    heroStat1S: "Au service de la communauté depuis 2007.",
    heroStat2T: "Ponctuel",
    heroStat2S: "Communication claire",
    heroStat3T: "Professionnel",
    heroStat3S: "Équipement adapté",

    // Sections
    secServicesK: "Ce qu’on fait",
    secServicesT: "Services principaux",
    secServicesS:
      "Trois services, un standard: travail propre, rapide et adapté à vos besoins.",

    serviceVitresT: "Lavage de vitres",
    serviceVitresD:
      "Intérieur/extérieur, cadrages, moustiquaires — pour maison plain-pied ou plusieurs étages.",
    serviceVitresH: "À partir de 165$ (plain-pied)",
    serviceVitresB1: "Résidentiel & commercial",
    serviceVitresB2: "Équipement pour hauteurs",
    serviceVitresB3: "Finition sans traces",
    serviceVitresIconAlt: "Icône lavage de vitres",

    serviceGoutT: "Vidange de gouttières",
    serviceGoutD:
      "Prévenez débordements et dommages en gardant vos gouttières dégagées.",
    serviceGoutH: "Inspection + nettoyage",
    serviceGoutB1: "Retrait des débris",
    serviceGoutB2: "Vérification d’écoulement",
    serviceGoutB3: "Conseils prévention",
    serviceGoutIconAlt: "Icône vidange de gouttières",

    servicePressT: "Nettoyage de revêtement",
    servicePressD:
      "Redonnez une apparence neuve aux surfaces: bois, béton, revêtement.",
    servicePressH: "Avant / Après",
    servicePressB1: "Allées & patios",
    servicePressB2: "Extérieur de la maison",
    servicePressB3: "Rampes & terrasses",
    servicePressIconAlt: "Icône nettoyage à pression",

    serviceCTA: "Obtenir une estimation gratuite",

    fastQuoteT: "Soumission plus rapide",
    fastQuoteP:
      "Envoyez quelques photos de l’extérieur de votre maison pour accélérer l’estimation.",
    fastQuoteEmail: "Obtenir une estimation gratuite",
    fastQuoteCall: "Appeler",

    secGalK: "Avant / Après",
    secGalT: "Réalisations",
    secGalS:
      "Découvrez nos réalisations en lavage de vitres, vidange de gouttières et nettoyage à pression. Des résultats professionnels pour maisons et commerces dans votre région.",
    tip: "Conseil",
    tipText:
      "Utilisez 12–20 photos maximum, bien cadrées, et ajoutez 3 sections: vitres, gouttières, pression.",

    secRevK: "Confiance",
    secRevT: "Ce que les clients aiment",
    secRevS: "Basé sur de vrais avis Google de nos clients.",
    reviewLabel: "Client résidentiel",
    val1T: "Ponctualité",
    val1D: "On respecte votre horaire et votre temps.",
    val2T: "Professionnalisme",
    val2D: "Équipement et méthodes adaptées à chaque surface.",
    val3T: "Résultat",
    val3D: "Détails soignés et nettoyage complet de la zone de travail.",
    galleryToggleMore: "Voir plus de réalisations",
    galleryToggleLess: "Voir moins",
    trustToggleMore: "Voir plus d’arguments de confiance",
    trustToggleLess: "Voir moins",

    secAreaK: "Territoire",
    secAreaT: "On se déplace chez vous",
    secAreaS:
      "Si vous êtes dans la région, il y a de fortes chances qu’on puisse vous servir.",
    cities: "Villes desservies",
    nearbyCities: "et les villes avoisinantes",
    areaP:
      "Pour les secteurs avoisinants, envoyez votre adresse et on vous confirme rapidement.",
    "territory.googleTile.title": "MrBen.ca",
    "territory.googleTile.ratingValue": "5,0",
    "territory.googleTile.reviewCount": "(61)",
    "territory.googleTile.subtitle": "Service de lavage de vitres",
    "territory.googleTile.aria": "Lire nos avis Google",
    zonesServedLabel: "Zones desservies :",
    convTip: "Astuce conversion",
    convTipText:
      "Ajoutez une carte Google + bouton “Itinéraire” et un encadré “Disponibilités” pour réduire les frictions.",
    googleMapsAlt: "Voir notre fiche Google Maps",

    contactK: "Estimation gratuite",
    contactT: "Contactez-nous",
    contactP:
      "Décrivez votre besoin et on vous répond rapidement. Pour accélérer, ajoutez des photos.",
    phone: "Téléphone",
    email: "Courriel",
    hours: "Heures",
    hoursText: "Lundi–Vendredi • 8h–17h",
    services: "Nettoyage",
    servicesMenuVitres: "Vitres",
    servicesMenuGout: "Gouttières",
    servicesMenuSiding: "Revêtement",

    formT: "Obtenir une estimation gratuite",
    formP:
      "Formulaire simplifié (UI). On peut le connecter à votre e-mail, Square, ou un CRM.",
    open: "Ouvrir",
    name: "Nom",
    phoneLabel: "Téléphone",
    emailLabel: "Courriel",
    address: "Adresse",
    choose: "Choisissez un ou plusieurs services",
    servicesRequested: "Services demandés",
    chooseServices: "Choisir les services",
    selected: "sélectionné(s)",
    desc: "Description",
    descHint:
      "Astuce : ajouter des photos accélère l’obtention d’un devis.",
    photoLabel: "Ajoutez quelques images de votre maison ici !",
    photoHelper: "JPG/PNG • 5 Mo max par photo • 1 à 5 photos",
    photoErrorMax: "Maximum 5 photos.",
    photoErrorType: "Formats acceptés : JPG/JPEG et PNG.",
    photoErrorSize: "Chaque photo doit faire 5 Mo ou moins.",
    photoRemove: "Retirer",
    send: "Envoyer la demande",
    modalTitle: "Obtenir une estimation gratuite",
    
    modalStep: "Étape",
    modalOf: "sur",
    cancel: "Annuler",
    back: "Retour",
    continue: "Continuer",
  },
  en: {
    // Global
    langShort: "EN",
    langLabel: "English",
    toggleTo: "FR",
    topTagline: "Free estimate • Courteous & on-time service",
    privacyPolicyLink: "Privacy Policy",

    // Nav
    navServices: "Services",
    navGallery: "Work",
    navReviews: "Reviews",
    navTerritory: "Area",
    navContact: "Contact",
    navCall: "Call",
    navOnline: "Get a free estimate",
    navSubTitle: "Cleaning",
    navSub: "Windows • Gutters • Siding",

    // Hero
    heroBadgeA: "Residential & commercial",
    heroBadgeB: "Laurentians & nearby",
    heroH1a: "Residential and commercial window cleaning in the Laurentides",
    heroH1b: "Lachute, Saint-Jérôme, Mirabel and surrounding areas",
    heroP:
      "Friendly, courteous and punctual team — fast, meticulous service with strong value.",
    heroCTA: "Get a free estimate",
    primaryCTA: "Get a free estimate",
    ctaReassurance: "Fast response • No obligation",
    heroTrust1: "Google",
    heroTrust2: "Local Laurentides business",
    heroTrust3: "Fully insured",
    heroTrust4: "Residential and commercial",
    heroVerifiedByGoogle: "Verified on Google",
    heroLeaveReview: "Leave a Google review",
    heroStat1T: "10+ years",
    heroStat1S: "Serving the community since 2007.",
    heroStat2T: "On time",
    heroStat2S: "Clear communication",
    heroStat3T: "Professional",
    heroStat3S: "Proper equipment",

    // Sections
    secServicesK: "What we do",
    secServicesT: "Core services",
    secServicesS: "Three services, one standard: clean, fast, and tailored to your needs.",

    serviceVitresT: "Window cleaning",
    serviceVitresD:
      "Inside/outside, frames, screens — single-storey homes or multi-level buildings.",
    serviceVitresH: "From $165 (single-storey)",
    serviceVitresB1: "Residential & commercial",
    serviceVitresB2: "Equipment for heights",
    serviceVitresB3: "Streak-free finish",
    serviceVitresIconAlt: "Window cleaning icon",

    serviceGoutT: "Gutter cleaning",
    serviceGoutD:
      "Prevent overflow and damage by keeping gutters clear.",
    serviceGoutH: "Inspection + clean",
    serviceGoutB1: "Remove debris",
    serviceGoutB2: "Flow check",
    serviceGoutB3: "Prevention advice",
    serviceGoutIconAlt: "Gutter cleaning icon",

    servicePressT: "Siding cleaning",
    servicePressD:
      "Restore wood, concrete and siding for a like-new look.",
    servicePressH: "Before / After",
    servicePressB1: "Driveways & patios",
    servicePressB2: "Home exterior",
    servicePressB3: "Railings & decks",
    servicePressIconAlt: "Pressure washing icon",

    serviceCTA: "Get a free estimate",

    fastQuoteT: "Faster quoting",
    fastQuoteP:
      "Send a few photos of the outside of your home to speed up the estimate.",
    fastQuoteEmail: "Get a free estimate",
    fastQuoteCall: "Call",

    secGalK: "Before / After",
    secGalT: "Work",
    secGalS:
      "Explore our recent window cleaning, gutter cleaning, and pressure washing projects. Professional results for homes and businesses in your area.",
    tip: "Tip",
    tipText:
      "Use 12–20 photos max, well framed, and group them: windows, gutters, pressure.",

    secRevK: "Trust",
    secRevT: "What clients like",
    secRevS: "Based on real Google reviews from our clients.",
    reviewLabel: "Residential client",
    val1T: "Punctual",
    val1D: "We respect your schedule and your time.",
    val2T: "Professional",
    val2D: "Methods and equipment matched to each surface.",
    val3T: "Results",
    val3D: "Meticulous finish and clean work area.",
    galleryToggleMore: "See more work",
    galleryToggleLess: "See less",
    trustToggleMore: "See more trust points",
    trustToggleLess: "See less",

    secAreaK: "Service area",
    secAreaT: "We come to you",
    secAreaS:
      "If you’re in the region, chances are we can serve you.",
    cities: "Cities served",
    nearbyCities: "and nearby cities",
    areaP:
      "For nearby sectors, send your address and we’ll confirm quickly.",
    "territory.googleTile.title": "MrBen.ca",
    "territory.googleTile.ratingValue": "5.0",
    "territory.googleTile.reviewCount": "(61)",
    "territory.googleTile.subtitle": "Window cleaning service",
    "territory.googleTile.aria": "Read our Google reviews",
    zonesServedLabel: "Service areas:",
    convTip: "Conversion tip",
    convTipText:
      "Add a Google map + “Directions” button and an “Availability” box to reduce friction.",
    googleMapsAlt: "View our Google Maps profile",

    contactK: "Free estimate",
    contactT: "Contact us",
    contactP:
      "Tell us what you need and we’ll respond quickly. Add photos for faster quoting.",
    phone: "Phone",
    email: "Email",
    hours: "Hours",
    hoursText: "Mon–Fri • 8am–5pm",
    services: "Cleaning",
    servicesMenuVitres: "Windows",
    servicesMenuGout: "Gutters",
    servicesMenuSiding: "Siding",

    formT: "Get a free estimate",
    open: "Open",
    name: "Name",
    phoneLabel: "Phone",
    emailLabel: "Email",
    address: "Address",
    choose: "Choose one or more services",
    servicesRequested: "Requested services",
    chooseServices: "Choose services",
    selected: "selected",
    desc: "Details",
    descHint: "Tip: adding photos speeds up quoting.",
    photoLabel: "Add a few images of your house here!",
    photoHelper: "JPG/PNG • 5 MB max per photo • up to 5 photos",
    photoErrorMax: "Maximum 5 photos.",
    photoErrorType: "Accepted formats: JPG/JPEG and PNG.",
    photoErrorSize: "Each photo must be 5 MB or less.",
    photoRemove: "Remove",
    send: "Send request",

    modalTitle: "Get a free estimate",
    modalStep: "Step",
    modalOf: "of",
    cancel: "Cancel",
    back: "Back",
    continue: "Continue",
  },
};

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function useI18n(lang) {
  const dict = i18n[lang] || i18n.fr;
  return (k) => dict[k] ?? k;
}


function SectionTitle({ kicker, title, subtitle, subtitleClassName }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {kicker ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{kicker}</span>
        </div>
      ) : null}
      <h2 className="mt-4 text-xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-2xl md:text-4xl md:leading-normal">
        {title}
      </h2>
      {subtitle ? (
        <p className={classNames("mt-3 text-base leading-relaxed text-zinc-600", subtitleClassName)}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}


function Hero({ onQuote, t, heroRef, sourceOfTruth }) {
  const [rating, setRating] = useState(5.0);
  const [reviewCount, setReviewCount] = useState(null);
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;
  const shouldReduceMotion = useReducedMotion();
  const heroTextShadow = { textShadow: "0 1px 2px rgba(0,0,0,0.35)" };

  const animatedStars = Array.from({ length: 5 }).map((_, index) => (
    <motion.span
      key={index}
      className="inline-flex"
      variants={{
        hidden: { opacity: 0, y: 2 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: "easeOut" },
        },
      }}
    >
      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
    </motion.span>
  ));

  useEffect(() => {
    let isMounted = true;

    const loadRating = async () => {
      try {
        const response = await fetch("/api/google-rating");
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (typeof data?.rating !== "number" || !Number.isFinite(data.rating)) {
          return;
        }
        if (isMounted) {
          setRating(data.rating);
          setReviewCount(
            typeof data?.count === "number" && Number.isFinite(data.count)
              ? data.count
              : null
          );
        }
      } catch {
        // Fail silently and keep fallback rating.
      }
    };

    loadRating();

    return () => {
      isMounted = false;
    };
  }, []);

  const ratingLine = (
    <>
      <span className="tabular-nums" style={heroTextShadow}>
        {rating.toFixed(1)}
      </span>
      {shouldReduceMotion ? (
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          ))}
        </span>
      ) : (
        <motion.span
          className="flex items-center gap-0.5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {animatedStars}
        </motion.span>
      )}
      {reviewCount !== null ? (
        <span className="tabular-nums" style={heroTextShadow}>
          ({reviewCount} {t("navReviews").toLowerCase()})
        </span>
      ) : null}
      <span aria-hidden="true" style={heroTextShadow}>
        ·
      </span>
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="8" fill="#34A853" />
        <path
          d="M4.4 8.3 6.9 10.6 11.6 5.6"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={heroTextShadow}>{t("heroVerifiedByGoogle")}</span>
    </>
  );

  return (
    <section ref={heroRef} id="hero" className="relative -mt-24 overflow-hidden bg-zinc-950 lg:-mt-28">
      <div className="absolute inset-0 opacity-100">
        <img src={IMAGE_URLS[0]} alt="Hero" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/50 to-zinc-950/80" />

      
      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-20 md:pb-20 md:pt-28 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-5xl text-center lg:text-left"
        >
          {/* NOTE: Hero intentionally uses two width bands:
              - Wide: badge + H1 (SEO/impact)
              - Narrow: heroP + trust + CTAs + stats (conversion)
              Avoid merging these wrappers unless redesigning the hero layout. */}
          <div className="mx-auto w-full">
            <div className="hidden items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15 md:inline-flex lg:justify-start">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span style={heroTextShadow}>{t("heroBadgeA")}</span>
              <span className="mx-1 text-white/30" style={heroTextShadow}>
                •
              </span>
              <MapPin className="h-3.5 w-3.5" />
              <span style={heroTextShadow}>{t("heroBadgeB")}</span>
            </div>

            <h1
              className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl md:text-5xl md:leading-normal"
              style={heroTextShadow}
            >
              {t("heroH1a")}
              <span
                className="block text-lg font-normal leading-snug text-white sm:text-xl md:text-3xl md:leading-normal"
                style={heroTextShadow}
              >
                {t("heroH1b")}
              </span>
            </h1>
            {sourceOfTruth ? (
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-base" style={heroTextShadow}>
                {sourceOfTruth}
              </p>
            ) : null}
          </div>
          <div className="mx-auto mt-4 w-full max-w-3xl lg:mx-0">
            <p className="hidden text-base leading-relaxed text-white/95 md:block" style={heroTextShadow}>
              {t("heroP")}
            </p>
            <div className="mt-4 md:mt-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
              <div className="flex flex-col items-center gap-3 text-xs text-white/90 sm:gap-3 sm:text-sm lg:col-span-7 lg:items-start">
                {placeId ? (
                  <a
                    href={`https://search.google.com/local/writereview?placeid=${placeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("heroLeaveReview")}
                    className="flex flex-wrap items-center justify-center gap-2 transition-opacity hover:opacity-90 lg:justify-start"
                  >
                    {ratingLine}
                  </a>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    {ratingLine}
                  </div>
                )}
                <div className="flex flex-col items-center gap-2 lg:items-start">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-white/80" />
                    <span style={heroTextShadow}>{t("heroTrust2")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-white/80" />
                    <span style={heroTextShadow}>{t("heroTrust3")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-white/80" />
                    <span style={heroTextShadow}>{t("heroTrust4")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-center lg:col-span-5 lg:mt-0 lg:justify-start">
                <div className="flex flex-col items-center gap-1 lg:items-start">
                  <button
                    onClick={onQuote}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100 cursor-pointer"
                  >
                    {t("primaryCTA")} <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-white/85" style={heroTextShadow}>
                    {t("ctaReassurance")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 hidden gap-3 overflow-x-auto pb-1 md:mt-6 md:grid md:grid-cols-3 md:gap-3 lg:mt-10">
              <HeroStat
                className="min-w-[170px] flex-shrink-0 md:min-w-0"
                icon={<Sparkles className="h-4 w-4" />}
                title={t("heroStat1T")}
                sub={t("heroStat1S")}
              />
              <HeroStat
                className="min-w-[170px] flex-shrink-0 md:min-w-0"
                icon={<Clock className="h-4 w-4" />}
                title={t("heroStat2T")}
                sub={t("heroStat2S")}
              />
              <HeroStat
                className="min-w-[170px] flex-shrink-0 md:min-w-0"
                icon={<Shield className="h-4 w-4" />}
                title={t("heroStat3T")}
                sub={t("heroStat3S")}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroStat({ icon, title, sub, className }) {
  const heroTextShadow = { textShadow: "0 1px 2px rgba(0,0,0,0.35)" };

  return (
    <div className={classNames("rounded-2xl bg-white/5 p-4 ring-1 ring-white/10", className)}>
      <div className="flex items-center gap-2 text-white">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">{icon}</div>
        <div>
          <div className="text-sm font-semibold" style={heroTextShadow}>
            {title}
          </div>
          <div className="hidden text-xs text-white/85 md:block" style={heroTextShadow}>
            {sub}
          </div>
        </div>
      </div>
    </div>
  );
}

function Services({ onQuote, t }) {
  const services = [
    {
      id: "vitres",
      title: t("serviceVitresT"),
      desc: t("serviceVitresD"),
      highlight: t("serviceVitresH"),
      iconSrc: "/icons/window-squeegee-90x70.png",
      iconAlt: t("serviceVitresIconAlt"),
      bullets: [t("serviceVitresB1"), t("serviceVitresB2"), t("serviceVitresB3")],
    },
    {
      id: "gouttieres",
      title: t("serviceGoutT"),
      desc: t("serviceGoutD"),
      highlight: t("serviceGoutH"),
      iconSrc: "/icons/gutter-leaves-90x70.png",
      iconAlt: t("serviceGoutIconAlt"),
      bullets: [t("serviceGoutB1"), t("serviceGoutB2"), t("serviceGoutB3")],
    },
    {
      id: "revetement",
      title: t("servicePressT"),
      desc: t("servicePressD"),
      highlight: t("servicePressH"),
      iconSrc: "/icons/pressure-wash-90x70.png",
      iconAlt: t("servicePressIconAlt"),
      bullets: [t("servicePressB1"), t("servicePressB2"), t("servicePressB3")],
    },
  ];

  return (
    <section id="services" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <SectionTitle kicker={t("secServicesK")} title={t("secServicesT")} subtitle={t("secServicesS")} />

        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
          {services.map((s, idx) => (
            <motion.div
              key={s.id}
              id={`service-${s.id}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-zinc-900">{s.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-zinc-600">{s.desc}</div>
                </div>
                <div className="flex h-[70px] w-[90px] items-center justify-center rounded-2xl">
                  <img src={s.iconSrc} alt={s.iconAlt} className="h-[70px] w-[90px] object-contain" />
                </div>
              </div>

              <div className="mt-5 hidden space-y-2 md:block">
                {s.bullets.map((b) => (
                  <div key={b} className="flex items-start gap-2 text-sm text-zinc-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 hidden h-1 w-full rounded-full bg-zinc-100 md:block">
                <div className="h-1 w-1/2 rounded-full bg-zinc-900 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm md:mt-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <div className="text-lg font-semibold text-zinc-900">{t("fastQuoteT")}</div>
              <p className="mt-1 text-sm text-zinc-600">{t("fastQuoteP")}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
              <div className="flex flex-col items-center gap-1 sm:items-start">
                <button
                  type="button"
                  onClick={onQuote}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 cursor-pointer"
                >
                  <Mail className="h-4 w-4" /> {t("primaryCTA")}
                </button>
                <span className="text-xs text-zinc-500">{t("ctaReassurance")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery({ t }) {
  const imgs = useMemo(() => IMAGE_URLS.slice(1), []);
  const [active, setActive] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const visibleImages = imgs.slice(0, 6);

  const toggleGallery = () => {
    setShowAll((prev) => {
      const next = !prev;
      if (!next && active > 5) {
        setActive(0);
      }
      return next;
    });
  };

  return (
    <section id="galerie" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-10 md:pb-16">
        <SectionTitle kicker={t("secGalK")} title={t("secGalT")} subtitle={t("secGalS")} />

        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto md:mt-10 md:hidden">
          {imgs.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className="w-[240px] flex-shrink-0 snap-start overflow-hidden rounded-3xl border border-zinc-200 shadow-sm"
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt="Work" className="h-[160px] w-full object-cover" />
            </button>
          ))}
        </div>

        <div className="mt-8 hidden grid-cols-1 gap-4 md:mt-10 md:grid md:gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-sm">
              <img src={imgs[active]} alt="Work" className="h-[320px] w-full object-cover sm:h-[420px]" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="max-h-none overflow-visible lg:max-h-[420px] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
                {visibleImages.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActive(i)}
                    className={classNames(
                      "overflow-hidden rounded-2xl border shadow-sm transition",
                      i === active ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                    )}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={src} alt="Thumb" className="h-28 w-full object-cover" />
                  </button>
                ))}
                {imgs.slice(6).map((src, index) => {
                  const i = index + 6;
                  return (
                    <button
                      key={src}
                      onClick={() => setActive(i)}
                      className={classNames(
                        "overflow-hidden rounded-2xl border shadow-sm transition hidden md:block",
                        showAll && "block md:block",
                        i === active ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                      )}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={src} alt="Thumb" className="h-28 w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 hidden justify-center md:hidden">
          <button
            type="button"
            onClick={toggleGallery}
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm"
          >
            {showAll ? t("galleryToggleLess") : t("galleryToggleMore")}
          </button>
        </div>
      </div>
    </section>
  );
}


function Reviews({ t, onQuote }) {
  const isFrench = t("langShort") === "FR";
  const [showAllTrust, setShowAllTrust] = useState(false);
  const reviews = [
    {
      name: "Laurie",
      textEn:
        "Very good job cleaning our windows inside and out and cleaning our gutters again this year. Highly recommend!",
      textFr:
        "Très bon travail : nettoyage des vitres intérieure et extérieure, et nettoyage des gouttières encore cette année. Je recommande fortement !",
      stars: 5,
    },
    {
      name: "Donna",
      textEn:
        "Very happy with the service provided by Mr. Ben. He showed up on time and was very thorough in the cleaning provided.",
      textFr:
        "Très satisfaite du service offert par MrBen. Il est arrivé à l’heure et a été très minutieux dans le nettoyage.",
      stars: 5,
    },
    {
      name: "Hadassah",
      textEn:
        "Efficient, quick and polite team, as well as a reasonably priced service. Recommend this company!",
      textFr:
        "Équipe efficace, rapide et polie, avec un service à prix raisonnable. Je recommande cette entreprise !",
      stars: 5,
    },
  ];

  return (
    <section id="avis" className="bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <SectionTitle kicker={t("secRevK")} title={t("secRevT")} subtitle={t("secRevS")} />

        <div className="mt-8 flex gap-4 overflow-x-auto md:mt-10 md:hidden">
          {reviews.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="w-[260px] flex-shrink-0 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                “{isFrench ? r.textFr : r.textEn}”
              </p>
              <div className="mt-4 text-sm font-semibold text-zinc-900">
                {r.name} • {t("reviewLabel")}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 hidden grid-cols-1 gap-4 md:mt-10 md:grid md:grid-cols-3 md:gap-5">
          {reviews.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                “{isFrench ? r.textFr : r.textEn}”
              </p>
              <div className="mt-4 text-sm font-semibold text-zinc-900">
                {r.name} • {t("reviewLabel")}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 hidden grid-cols-1 gap-4 md:mt-10 md:grid md:grid-cols-3 md:gap-5">
          <ValueCard icon={<Clock className="h-5 w-5" />} title={t("val1T")} desc={t("val1D")} />
          <div className={classNames("hidden md:block", showAllTrust && "block md:block")}>
            <ValueCard icon={<Shield className="h-5 w-5" />} title={t("val2T")} desc={t("val2D")} />
          </div>
          <div className={classNames("hidden md:block", showAllTrust && "block md:block")}>
            <ValueCard icon={<Sparkles className="h-5 w-5" />} title={t("val3T")} desc={t("val3D")} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 place-items-center md:mt-10">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={onQuote}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 cursor-pointer"
              >
                {t("primaryCTA")} <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-zinc-500">{t("ctaReassurance")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-900 text-white">{icon}</div>
        <div>
          <div className="text-sm font-semibold text-zinc-900">{title}</div>
          <div className="text-sm text-zinc-600">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function ServiceArea({ t }) {
  const isFrench = t("langShort") === "FR";

  return (
    <section
      id="territoire"
      className="relative overflow-hidden"
      style={{
        backgroundImage: "url('/territoire-map.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Light overlay so text/cards stay readable */}
      <div className="absolute inset-0 bg-white/70" />

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-16">
        <SectionTitle
          kicker={t("secAreaK")}
          title={t("secAreaT")}
          subtitle={t("secAreaS")}
          subtitleClassName="hidden md:block"
        />

        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="text-sm font-semibold text-zinc-900">
              {t("cities")}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SERVICE_AREAS.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-700 md:px-3 md:py-1 md:text-sm"
                >
                  <MapPin className="mr-1.5 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                  {c}
                </span>
              ))}
              <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-700 md:px-3 md:py-1 md:text-sm">
                <MapPin className="mr-1.5 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                {t("nearbyCities")}
              </span>
            </div>

            <p className="mt-5 hidden text-sm text-zinc-600 md:block">{t("areaP")}</p>
            <p className="mt-4 text-xs text-zinc-600"></p>
          </div>

          <a
            className="flex cursor-pointer items-center justify-center rounded-3xl border border-zinc-200 bg-white p-6 text-left shadow-sm"
            href={BRAND.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("territory.googleTile.aria")}
          >
            <div className="flex w-full max-w-[82%] flex-col gap-2">
              <div className="text-xl font-semibold text-zinc-900">
                {t("territory.googleTile.title")}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-base text-zinc-700">
                <span className="font-semibold text-zinc-900">
                  {t("territory.googleTile.ratingValue")}
                </span>
                <span className="text-yellow-500">★★★★★</span>
                <span>{t("territory.googleTile.reviewCount")}</span>
              </div>
              <div className="text-base text-zinc-600">
                {t("territory.googleTile.subtitle")}
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function Contact({ t, contactRef }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    message: "",
  });
  const [company, setCompany] = useState("");
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const autocompleteListenerRef = useRef(null);

  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");
  const [previews, setPreviews] = useState([]);

  const [services, setServices] = useState([]);

  const [status, setStatus] = useState({ state: "idle", message: "" });
  // state: "idle" | "sending" | "success" | "error"

  const MAX_IMAGES = 5;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_COMPRESSED_SIZE = 600 * 1024;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const serviceOptions = [
    t("langShort") === "FR" ? "Lavage de vitres intérieures/extérieures" : "Interior/exterior windows",
    t("langShort") === "FR" ? "Lavage de vitres extérieures seulement" : "Exterior windows only",
    t("langShort") === "FR" ? "Vidange de gouttières" : "Gutter cleaning",
    t("langShort") === "FR" ? "Lavage de revêtement" : "Siding wash",
  ];

  function toggleService(label) {
    setServices((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  }

  function validateImages(list) {
    if (list.length > MAX_IMAGES) {
      return t("photoErrorMax");
    }
    if (list.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type))) {
      return t("photoErrorType");
    }
    if (list.some((file) => file.size > MAX_IMAGE_SIZE)) {
      return t("photoErrorSize");
    }
    return "";
  }

  async function compressImage(file) {
    if (!file.type.startsWith("image/")) return file;

    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      imageBitmap.close?.();
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const nextName = `${baseName}.jpg`;
    const qualitySteps = [0.82, 0.72, 0.62, 0.52, 0.45];
    const dimensionSteps = [2000, 1600, 1280];
    const longestEdge = Math.max(imageBitmap.width, imageBitmap.height);

    const toBlob = (quality) =>
      new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
      });

    let finalBlob = null;

    for (const maxEdge of dimensionSteps) {
      const scale = Math.min(1, maxEdge / longestEdge);
      const targetWidth = Math.max(1, Math.round(imageBitmap.width * scale));
      const targetHeight = Math.max(1, Math.round(imageBitmap.height * scale));

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      context.clearRect(0, 0, targetWidth, targetHeight);
      context.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

      for (const quality of qualitySteps) {
        const blob = await toBlob(quality);
        if (blob && blob.size <= MAX_COMPRESSED_SIZE) {
          finalBlob = blob;
          break;
        }
      }

      if (finalBlob) break;
    }

    imageBitmap.close?.();

    if (!finalBlob) {
      throw new Error("image_too_large");
    }

    return new File([finalBlob], nextName, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  }

  React.useEffect(() => {
    const nextPreviews = images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(nextPreviews);
    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [images]);

  useEffect(() => {
    let isMounted = true;

    loadGooglePlaces().then(() => {
      if (!isMounted || !addressInputRef.current) return;
      const googleMaps = /** @type {any} */ (window.google);
      if (!googleMaps?.maps?.places) return;
      if (autocompleteRef.current) return;
      const autocomplete = new googleMaps.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "ca" },
        }
      );

      autocomplete.setFields?.(["address_components", "formatted_address"]);

      const handlePlaceChanged = () => {
        const place = autocomplete.getPlace?.();
        const formatted = place?.formatted_address;
        if (!formatted || !place?.address_components?.length) return;

        setForm((prev) => ({ ...prev, address: formatted }));
      };

      const listener = autocomplete.addListener("place_changed", handlePlaceChanged);
      autocompleteRef.current = autocomplete;
      autocompleteListenerRef.current = listener;
    });

    return () => {
      isMounted = false;
      if (autocompleteListenerRef.current?.remove) {
        autocompleteListenerRef.current.remove();
      }
      autocompleteListenerRef.current = null;
      autocompleteRef.current = null;
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();

    const validationMessage = validateImages(images);
    if (validationMessage) {
      setImageError(validationMessage);
      setStatus({
        state: "error",
        message: validationMessage,
      });
      return;
    }

    setStatus({ state: "sending", message: "" });

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("address", String(form.address ?? ""));
      formData.append("services", JSON.stringify(services));
      formData.append("message", form.message);
      formData.append("company", company);
      images.forEach((file) => {
        formData.append("images", file);
      });

      let res;
      try {
        res = await fetch("/api/contact", {
          method: "POST",
          body: formData,
        });
      } catch (error) {
        console.error("Contact form network error:", error);
        setStatus({
          state: "error",
          message:
            t("langShort") === "FR"
              ? "Erreur réseau. Veuillez réessayer."
              : "Network error. Please try again.",
        });
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setStatus({
          state: "error",
          message:
            data?.error ||
            (t("langShort") === "FR"
              ? "Échec de l’envoi. Veuillez réessayer."
              : "Failed to send. Please try again."),
        });
        return;
      }

      setStatus({
        state: "success",
        message:
          t("langShort") === "FR"
            ? "Message envoyé. Nous vous contacterons sous peu."
            : "Message sent. We will contact you shortly.",
      });

      setForm({ name: "", phone: "", email: "", address: "", message: "" });
      setCompany("");
      setServices([]);
      setImages([]);
      setImageError("");
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus({
        state: "error",
        message:
          t("langShort") === "FR"
            ? "Erreur réseau. Veuillez réessayer."
            : "Network error. Please try again.",
      });
    }
  }

  return (
    <section id="contact" className="bg-zinc-950">
      <div ref={contactRef} aria-hidden="true" className="h-0 w-full" />
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("contactK")}</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold leading-tight tracking-tight text-white md:text-3xl md:leading-normal">
              {t("contactT")}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-white/75">{t("contactP")}</p>

            <div className="mt-5 space-y-2 md:mt-6 md:space-y-3">
              <a
                href={BRAND.phoneHref}
                className="flex items-center justify-between rounded-3xl bg-white/10 px-5 py-4 text-white ring-1 ring-white/15 hover:bg-white/15"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t("phone")}</div>
                    <div className="text-sm text-white/75">{BRAND.phoneDisplay}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-white/60" />
              </a>

              <a
                href={toMailto(BRAND.emailHref)}
                className="flex items-center justify-between rounded-3xl bg-white/10 px-5 py-4 text-white ring-1 ring-white/15 hover:bg-white/15"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t("email")}</div>
                    <div className="text-sm text-white/75">{BRAND.email}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-white/60" />
              </a>
            </div>

            <div className="mt-8 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white">{t("hours")}</div>
              <div className="mt-1 text-sm text-white/75">{t("hoursText")}</div>
              <div className="mt-4 hidden text-sm font-semibold text-white md:block">{t("services")}</div>
              <div className="mt-2 hidden flex-wrap gap-2 md:flex">
                {[t("servicesMenuVitres"), t("servicesMenuGout"), t("servicesMenuSiding")].map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 ring-1 ring-white/10"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-zinc-900">{t("formT")}</div>
              </div>
            </div>

            <form onSubmit={onSubmit}>
              <div className="absolute left-[-10000px] top-auto h-0 w-0 overflow-hidden">
                <label>
                  Company
                  <input
                    type="text"
                    name="company"
                    autoComplete="off"
                    tabIndex={-1}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={t("name")}
                  placeholder={t("name")}
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  label={t("phoneLabel")}
                  placeholder="450-555-0123"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: formatPhoneNumber(e.target.value) }))
                  }
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                />
                <Input
                  label={t("emailLabel")}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
                <Input
                  label={t("address")}
                  placeholder={t("address")}
                  inputRef={addressInputRef}
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                />
              </div>

              <div className="mt-4">
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-zinc-900">{t("choose")}</div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {serviceOptions.map((x) => (
                      <label key={x} className="flex items-start gap-2 rounded-2xl border border-zinc-200 p-3">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={services.includes(x)}
                          onChange={() => toggleService(x)}
                        />
                        <span className="text-sm text-zinc-700">{x}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:hidden">
                  <details className="group">
                    <summary className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-left text-sm font-semibold text-zinc-900 shadow-sm">
                      <span className="flex flex-col">
                        <span>{t("servicesRequested")}</span>
                        <span className="text-xs font-medium text-zinc-500">
                          {t("chooseServices")}
                          {services.length > 0 ? (
                            <span className="ml-2 text-[11px] text-zinc-400" aria-live="polite">
                              ({services.length} {t("selected")})
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span
                        className="ml-3 text-zinc-400 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      >
                        ▾
                      </span>
                    </summary>
                    <div className="pt-3">
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {serviceOptions.map((x) => (
                          <label key={x} className="flex items-start gap-2 rounded-2xl border border-zinc-200 p-3">
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={services.includes(x)}
                              onChange={() => toggleService(x)}
                            />
                            <span className="text-sm text-zinc-700">{x}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-zinc-900">{t("desc")}</div>
                <textarea
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  placeholder={
                    t("langShort") === "FR"
                      ? "Ex.: maison plain-pied, 12 fenêtres, besoin vitres + gouttières..."
                      : "Example: single-storey, 12 windows, need windows + gutters..."
                  }
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                />
                <p className="mt-2 text-xs text-zinc-500">{t("descHint")}</p>
              </div>

              {/* Image upload */}
              <div className="mt-4">
                <div className="text-sm font-semibold text-zinc-900">
                  {t("photoLabel")}
                </div>

                <label
                  htmlFor="contactPhotos"
                  className="mt-2 block cursor-pointer rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-200 hover:bg-black/5 active:opacity-90"
                >
                  <input
                    id="contactPhotos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="block w-full cursor-pointer text-sm text-zinc-900"
                    onChange={async (e) => {
                      const selected = Array.from(e.target.files || []);
                      if (!selected.length) return;

                      const nextImages = [...images, ...selected];
                      const validationMessage = validateImages(nextImages);

                      if (validationMessage) {
                        setImageError(validationMessage);
                        setStatus({ state: "idle", message: "" });
                        e.target.value = "";
                        return;
                      }

                      const compressionResults = await Promise.allSettled(
                        selected.map((file) => compressImage(file))
                      );
                      const compressedFiles = compressionResults
                        .filter((result) => result.status === "fulfilled")
                        .map((result) => result.value);
                      const failedCompression = compressionResults.some(
                        (result) => result.status === "rejected"
                      );

                      if (failedCompression) {
                        setImageError(
                          t("langShort") === "FR"
                            ? "Impossible de compresser une image sous 600 Ko."
                            : "Unable to compress an image below 600KB."
                        );
                        setStatus({ state: "idle", message: "" });
                        e.target.value = "";
                        return;
                      }

                      const compressedImages = [...images, ...compressedFiles];
                      const compressedValidationMessage = validateImages(compressedImages);

                      if (compressedValidationMessage) {
                        setImageError(compressedValidationMessage);
                        setStatus({ state: "idle", message: "" });
                        e.target.value = "";
                        return;
                      }

                      setImages(compressedImages);
                      setImageError("");
                      setStatus({ state: "idle", message: "" });
                      e.target.value = "";
                    }}
                  />

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>{t("photoHelper")}</span>
                    <span className="hidden text-zinc-300 sm:inline">•</span>
                    <span>
                      {t("langShort") === "FR"
                        ? `${images.length} sur ${MAX_IMAGES} sélectionnées`
                        : `${images.length} of ${MAX_IMAGES} selected`}
                    </span>
                  </div>
                </label>

                {imageError && (
                  <p className="mt-2 text-xs text-red-600">{imageError}</p>
                )}

                {previews.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {previews.map((preview, index) => (
                      <div
                        key={`${preview.url}-${preview.file.name}`}
                        className="relative h-20 w-20 overflow-hidden rounded-2xl border border-zinc-200"
                      >
                        <img
                          src={preview.url}
                          alt={preview.file.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          aria-label={t("photoRemove")}
                          className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-zinc-700 shadow-sm"
                          onClick={() => {
                            const next = images.filter((_, i) => i !== index);
                            setImages(next);
                            setImageError(validateImages(next));
                          }}
                        >
                          {t("photoRemove")}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


              {status.state !== "idle" && (
                <div
                  className={`mt-4 rounded-2xl p-3 text-sm ${
                    status.state === "success"
                      ? "bg-emerald-50 text-emerald-900"
                      : status.state === "error"
                      ? "bg-red-50 text-red-900"
                      : "bg-zinc-50 text-zinc-900"
                  }`}
                >
                  {status.state === "sending"
                    ? t("langShort") === "FR"
                      ? "Envoi en cours..."
                      : "Sending..."
                    : status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={status.state === "sending"}
                className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 active:opacity-90 disabled:opacity-60"
              >
                {status.state === "sending"
                  ? t("langShort") === "FR"
                    ? "Envoi..."
                    : "Sending..."
                  : t("send")}{" "}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8 text-center text-xs text-white/60">
          © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          <span className="mx-1 text-zinc-500">·</span>
          <Link
            className="text-zinc-500 transition hover:underline"
            href={t("langShort") === "FR" ? "/confidentialite" : "/privacy-policy"}
          >
            {t("privacyPolicyLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Input({ label, inputRef, ...inputProps }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-zinc-900">{label}</div>
      <input
        ref={inputRef}
        {...inputProps}
        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
      />
    </label>
  );
}

function QuoteModal({ open, onClose, t }) {
  const [step, setStep] = useState(1);
  const [quotePhone, setQuotePhone] = useState("");

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-zinc-900">{t("modalTitle")}</div>
                <div className="mt-1 text-sm text-zinc-600">
                  {t("modalStep")} {step} {t("modalOf")} 2 — {t("langShort") === "FR" ? "rapide et simple" : "quick and simple"}.
                </div>
              </div>
              <button
                className="grid h-10 w-10 place-items-center rounded-2xl border border-zinc-200 hover:bg-zinc-50"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {step === 1 ? (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label={t("name")} placeholder={t("name")} />
                <Input
                  label={t("phoneLabel")}
                  placeholder="450-555-0123"
                  value={quotePhone}
                  onChange={(e) => setQuotePhone(formatPhoneNumber(e.target.value))}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                />
                <Input label={t("emailLabel")} placeholder="you@example.com" />
                <Input label={t("address")} placeholder={t("address")} />
                <div className="sm:col-span-2">
                  <div className="hidden md:block">
                    <div className="text-sm font-semibold text-zinc-900">{t("choose")}</div>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {[
                        t("langShort") === "FR" ? "Vitres int./ext." : "Interior/exterior windows",
                        t("langShort") === "FR" ? "Vitres ext. seulement" : "Exterior only",
                        t("langShort") === "FR" ? "Vidange gouttières" : "Gutter cleaning",
                        t("langShort") === "FR" ? "Lavage revêtement" : "Siding wash",
                      ].map((x) => (
                        <label key={x} className="flex items-start gap-2 rounded-2xl border border-zinc-200 p-3">
                          <input type="checkbox" className="mt-1" />
                          <span className="text-sm text-zinc-700">{x}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:hidden">
                    <details className="group">
                      <summary className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-left text-sm font-semibold text-zinc-900 shadow-sm">
                        <span className="flex flex-col">
                          <span>{t("servicesRequested")}</span>
                          <span className="text-xs font-medium text-zinc-500">
                            {t("chooseServices")}
                          </span>
                        </span>
                        <span
                          className="ml-3 text-zinc-400 transition-transform group-open:rotate-180"
                          aria-hidden="true"
                        >
                          ▾
                        </span>
                      </summary>
                      <div className="pt-3">
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {[
                            t("langShort") === "FR" ? "Vitres int./ext." : "Interior/exterior windows",
                            t("langShort") === "FR" ? "Vitres ext. seulement" : "Exterior only",
                            t("langShort") === "FR" ? "Vidange gouttières" : "Gutter cleaning",
                            t("langShort") === "FR" ? "Lavage revêtement" : "Siding wash",
                          ].map((x) => (
                            <label key={x} className="flex items-start gap-2 rounded-2xl border border-zinc-200 p-3">
                              <input type="checkbox" className="mt-1" />
                              <span className="text-sm text-zinc-700">{x}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="text-sm font-semibold text-zinc-900">{t("desc")}</div>
                <textarea
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  placeholder={
                    t("langShort") === "FR"
                      ? "Décrivez le travail (ex.: nombre de fenêtres, hauteur, accès, etc.)."
                      : "Describe the job (e.g., window count, height, access, etc.)."
                  }
                />

              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
                onClick={() => (step === 1 ? onClose() : setStep(1))}
              >
                {step === 1 ? t("cancel") : t("back")}
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
                onClick={() => (step === 1 ? setStep(2) : alert("Preview: connect submission to email/CRM."))}
              >
                {step === 1 ? t("continue") : t("send")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function MrBenRedesignPreview({ sourceOfTruth }) {
  const { locale } = useLocale();
  const t = useI18n(locale);
  const heroRef = useRef(null);
  const contactRef = useRef(null);
  const [isContactInView, setIsContactInView] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const scrollToContact = React.useCallback(() => {
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
    const handleFocusIn = (event) => {
      const target = event.target;
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
        <Hero onQuote={scrollToContact} t={t} heroRef={heroRef} sourceOfTruth={sourceOfTruth} />
        <Services onQuote={scrollToContact} t={t} />
        <Gallery t={t} />
        <Reviews t={t} onQuote={scrollToContact} />
        <ServiceArea t={t} />
        <Contact t={t} contactRef={contactRef} />
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
            href={BRAND.phoneHref}
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
