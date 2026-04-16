"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
} from "lucide-react";

const BRAND = {
  name: "MrBen.ca",
  phoneDisplay: "514-699-7145",
  phoneHref: "tel:+15146997145",
  email: "info@mrben.ca",
  emailHref: "mailto:info@mrben.ca",
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
  "and nearby cities",
];

const IMAGE_URLS = [
  "/hero.jpg",
  "/gallery/lavage-vitres-exterieur-maison.jpg",
  "/gallery/lavage-vitres-lachute-avant-apres.jpg",
  "/gallery/lavage-pression-beton.jpg",
  "/gallery/nettoyage-gouttieres-maison.jpg",
  "/gallery/lavage-vitres-residentiel-avant-apres.jpg",
  "/gallery/lavage-vitres-saint-sauveur-maison.jpg",
  "/gallery/nettoyage-revetement-exterieur.jpg",
  "/gallery/lavage-vitres-mirabel-maison.jpg",
  "/gallery/lavage-vitres-residentiel-detail.jpg",
];

const i18n = {
  fr: {
    langShort: "FR",
    topTagline: "Estimation gratuite • Service courtois & ponctuel",
    heroBadgeA: "Résidentiel & commercial",
    heroBadgeB: "Laurentides & environs",
    heroH1a: "Des vitres impeccables.",
    heroH1b: "Une maison qui a l’air neuve.",
    heroP: "Équipe attentionnée, courtoise et ponctuelle — service rapide et soigné pour vous offrir le meilleur rapport qualité-prix.",
    heroCTA: "Obtenir une estimation gratuite",
    heroStat1T: "Finition sans traces",
    heroStat1S: "Détails soignés",
    heroStat2T: "Ponctuel",
    heroStat2S: "Communication claire",
    heroStat3T: "Professionnel",
    heroStat3S: "Équipement adapté",
    secServicesK: "Ce qu’on fait",
    secServicesT: "Services principaux",
    secServicesS: "Trois services, un standard: travail propre, rapide et durable.",
    serviceVitresT: "Lavage de vitres",
    serviceVitresD: "Intérieur/extérieur, cadrages, moustiquaires — pour maison plain-pied ou plusieurs étages.",
    serviceVitresH: "À partir de 165$ (plain-pied)",
    serviceVitresB1: "Résidentiel & commercial",
    serviceVitresB2: "Équipement pour hauteurs",
    serviceVitresB3: "Finition sans traces",
    serviceGoutT: "Vidange de gouttières",
    serviceGoutD: "Prévenez débordements et dommages en gardant vos gouttières dégagées.",
    serviceGoutH: "Inspection + nettoyage",
    serviceGoutB1: "Retrait des débris",
    serviceGoutB2: "Vérification d’écoulement",
    serviceGoutB3: "Conseils prévention",
    servicePressT: "Nettoyage à pression",
    servicePressD: "Redonnez une apparence neuve aux surfaces: bois, béton, revêtement.",
    servicePressH: "Avant / Après",
    servicePressB1: "Allées & patios",
    servicePressB2: "Revêtement extérieur",
    servicePressB3: "Clôtures & terrasses",
    serviceCTA: "Demander une soumission",
    fastQuoteT: "Soumission plus rapide",
    fastQuoteP: "Envoyez quelques photos de l’extérieur de votre maison par courriel — cela accélère l’estimation.",
    fastQuoteEmail: "Envoyer un courriel",
    fastQuoteCall: "Appeler",
    secGalK: "Avant / Après",
    secGalT: "Réalisations",
    secGalS: "Un travail méticuleux pour un résultat qui dure.",
    secRevK: "Confiance",
    secRevT: "Ce que les clients aiment",
    secRevS: "Des clients satisfaits saison après saison.",
    val1T: "Ponctualité",
    val1D: "On respecte votre horaire et on confirme avant d’arriver.",
    val2T: "Professionnalisme",
    val2D: "Équipement et méthodes adaptées à chaque surface.",
    val3T: "Résultat",
    val3D: "Détails soignés et nettoyage complet de la zone de travail.",
    secAreaK: "Territoire",
    secAreaT: "On se déplace chez vous",
    secAreaS: "Si vous êtes dans la région, il y a de fortes chances qu’on puisse vous servir.",
    cities: "Villes desservies",
    areaP: "Pour les secteurs limitrophes, envoyez votre adresse et on vous confirme rapidement.",
    convTip: "Disponibilité",
    convTipText: "Nous sommes actuellement en pleine période de réservation pour le printemps. Réservez votre place tôt!",
    contactK: "Estimation gratuite",
    contactT: "Contactez-nous",
    contactP: "Décrivez votre besoin et on vous répond rapidement. Pour accélérer, ajoutez des photos.",
    phone: "Téléphone",
    email: "Courriel",
    hours: "Heures",
    hoursText: "Lundi–Vendredi • 8h–17h",
    services: "Services",
    formT: "Demande en ligne",
    formP: "Remplissez le formulaire pour une estimation rapide.",
    name: "Nom",
    phoneLabel: "Téléphone",
    emailLabel: "Courriel",
    address: "Adresse",
    choose: "Choisissez un ou plusieurs services",
    desc: "Description",
    descHint: "Astuce: joindre des photos par courriel accélère la soumission.",
    send: "Envoyer la demande",
    quick: "Option rapide",
    quickTextA: "Envoyez des photos à ",
    modalTitle: "Demande en ligne",
    modalStep: "Étape",
    modalOf: "sur",
    cancel: "Annuler",
    back: "Retour",
    continue: "Continuer",
  },
  en: {
    langShort: "EN",
    topTagline: "Free estimate • Courteous & on-time service",
    heroBadgeA: "Residential & commercial",
    heroBadgeB: "Laurentians & nearby",
    heroH1a: "Spotless windows.",
    heroH1b: "A home that looks new.",
    heroP: "Friendly, courteous and punctual team — fast, meticulous service with strong value.",
    heroCTA: "Get a free estimate",
    heroStat1T: "Streak-free finish",
    heroStat1S: "Attention to detail",
    heroStat2T: "On time",
    heroStat2S: "Clear communication",
    heroStat3T: "Professional",
    heroStat3S: "Proper equipment",
    secServicesK: "What we do",
    secServicesT: "Core services",
    secServicesS: "Three services, one standard: clean, fast, durable work.",
    serviceVitresT: "Window cleaning",
    serviceVitresD: "Inside/outside, frames, screens — single-storey homes or multi-level buildings.",
    serviceVitresH: "From $165 (single-storey)",
    serviceVitresB1: "Residential & commercial",
    serviceVitresB2: "Equipment for heights",
    serviceVitresB3: "Streak-free finish",
    serviceGoutT: "Gutter cleaning",
    serviceGoutD: "Prevent overflow and damage by keeping gutters clear.",
    serviceGoutH: "Inspection + clean",
    serviceGoutB1: "Remove debris",
    serviceGoutB2: "Flow check",
    serviceGoutB3: "Prevention advice",
    servicePressT: "Pressure washing",
    servicePressD: "Restore wood, concrete and siding for a like-new look.",
    servicePressH: "Before / After",
    servicePressB1: "Driveways & patios",
    servicePressB2: "Exterior siding",
    servicePressB3: "Fences & decks",
    serviceCTA: "Request a quote",
    fastQuoteT: "Faster quoting",
    fastQuoteP: "Email a few exterior photos — it helps us estimate faster.",
    fastQuoteEmail: "Email us",
    fastQuoteCall: "Call",
    secGalK: "Before / After",
    secGalT: "Work",
    secGalS: "Meticulous work for results that last.",
    secRevK: "Trust",
    secRevT: "What clients like",
    secRevS: "Satisfied customers season after season.",
    val1T: "Punctual",
    val1D: "We respect your schedule and confirm before arrival.",
    val2T: "Professional",
    val2D: "Methods and equipment matched to each surface.",
    val3T: "Results",
    val3D: "Meticulous finish and clean work area.",
    secAreaK: "Service area",
    secAreaT: "We come to you",
    secAreaS: "If you’re in the region, chances are we can serve you.",
    cities: "Cities served",
    areaP: "For nearby sectors, send your address and we’ll confirm quickly.",
    convTip: "Availability",
    convTipText: "We are currently in the peak spring booking season. Reserve your spot early!",
    contactK: "Free estimate",
    contactT: "Contact us",
    contactP: "Tell us what you need and we’ll respond quickly. Add photos for faster quoting.",
    phone: "Phone",
    email: "Email",
    hours: "Hours",
    hoursText: "Mon–Fri • 8am–5pm",
    services: "Services",
    formT: "Online request",
    formP: "Fill out the form for a quick estimate.",
    name: "Name",
    phoneLabel: "Phone",
    emailLabel: "Email",
    address: "Address",
    choose: "Choose one or more services",
    desc: "Details",
    descHint: "Tip: emailing photos speeds up quoting.",
    send: "Send request",
    quick: "Quick option",
    quickTextA: "Email photos to ",
    modalTitle: "Online request",
    modalStep: "Step",
    modalOf: "of",
    cancel: "Cancel",
    back: "Back",
    continue: "Continue",
  },
};

function classNames(...xs: (string | boolean | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

function SectionTitle({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {kicker ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{kicker}</span>
        </div>
      ) : null}
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-base leading-relaxed text-zinc-600">{subtitle}</p>
      ) : null}
    </div>
  );
}

function Hero({ onQuote, t }: { onQuote: () => void; t: (k: keyof typeof i18n.fr) => string }) {
  return (
    <div className="relative overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 opacity-100">
        <img src={IMAGE_URLS[0]} alt="Hero" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/30 to-zinc-950/70" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{t("heroBadgeA")}</span>
            <span className="mx-1 text-white/30">•</span>
            <MapPin className="h-3.5 w-3.5" />
            <span>{t("heroBadgeB")}</span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            {t("heroH1a")}
            <span className="block text-white/90">{t("heroH1b")}</span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/80">{t("heroP")}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={onQuote}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100 transition-colors"
            >
              {t("heroCTA")} <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href={BRAND.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-6 py-4 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15 transition-colors"
            >
              <Phone className="h-4 w-4" /> {BRAND.phoneDisplay}
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <HeroStat icon={<Sparkles className="h-4 w-4" />} title={t("heroStat1T")} sub={t("heroStat1S")} />
            <HeroStat icon={<Clock className="h-4 w-4" />} title={t("heroStat2T")} sub={t("heroStat2S")} />
            <HeroStat icon={<Shield className="h-4 w-4" />} title={t("heroStat3T")} sub={t("heroStat3S")} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function HeroStat({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-3 text-white">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">{icon}</div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-white/70">{sub}</div>
        </div>
      </div>
    </div>
  );
}

function Services({ t }: { t: (k: keyof typeof i18n.fr) => string }) {
  const services = [
    {
      id: "vitres",
      title: t("serviceVitresT"),
      desc: t("serviceVitresD"),
      highlight: t("serviceVitresH"),
      bullets: [t("serviceVitresB1"), t("serviceVitresB2"), t("serviceVitresB3")],
    },
    {
      id: "gouttieres",
      title: t("serviceGoutT"),
      desc: t("serviceGoutD"),
      highlight: t("serviceGoutH"),
      bullets: [t("serviceGoutB1"), t("serviceGoutB2"), t("serviceGoutB3")],
    },
    {
      id: "pression",
      title: t("servicePressT"),
      desc: t("servicePressD"),
      highlight: t("servicePressH"),
      bullets: [t("servicePressB1"), t("servicePressB2"), t("servicePressB3")],
    },
  ];

  return (
    <section id="services" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <SectionTitle kicker={t("secServicesK")} title={t("secServicesT")} subtitle={t("secServicesS")} />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="group rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-semibold text-zinc-900">{s.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-zinc-600">{s.desc}</div>
                </div>
                <div className="shrink-0 rounded-2xl bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                  {s.highlight}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {s.bullets.map((b: string) => (
                  <div key={b} className="flex items-start gap-2 text-sm text-zinc-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-zinc-900" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <a href="#contact" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:opacity-80">
                {t("serviceCTA")} <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
            <div className="md:col-span-2">
              <div className="text-xl font-semibold text-zinc-900">{t("fastQuoteT")}</div>
              <p className="mt-2 text-base text-zinc-600">{t("fastQuoteP")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <a
                href={BRAND.emailHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50"
              >
                <Mail className="h-4 w-4" /> {t("fastQuoteEmail")}
              </a>
              <a
                href={BRAND.phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
              >
                <Phone className="h-4 w-4" /> {t("fastQuoteCall")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery({ t }: { t: (k: keyof typeof i18n.fr) => string }) {
  const imgs = useMemo(() => IMAGE_URLS.slice(1), []);
  const [active, setActive] = useState(0);

  return (
    <section id="galerie" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:pb-24">
        <SectionTitle kicker={t("secGalK")} title={t("secGalT")} subtitle={t("secGalS")} />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-sm aspect-[4/3] sm:aspect-auto sm:h-[480px]">
              <img src={imgs[active]} alt="Work" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-2">
              {imgs.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  className={classNames(
                    "overflow-hidden rounded-2xl border shadow-sm transition aspect-square lg:aspect-video",
                    i === active ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={src} alt="Thumb" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews({ t }: { t: (k: keyof typeof i18n.fr) => string }) {
  const reviews = [
    {
      name: t("langShort") === "FR" ? "Client résidentiel" : "Residential client",
      quote: t("langShort") === "FR" ? "Service rapide, courtois et le résultat est impeccable. Les vitres n’ont jamais été aussi claires." : "Fast, courteous service and an impeccable result. The windows have never been clearer.",
      stars: 5,
    },
    {
      name: t("langShort") === "FR" ? "Client commercial" : "Commercial client",
      quote: t("langShort") === "FR" ? "Ponctuels et professionnels. Très bonne communication et travail propre du début à la fin." : "On time and professional. Great communication and clean work from start to finish.",
      stars: 5,
    },
    {
      name: t("langShort") === "FR" ? "Client résidentiel" : "Residential client",
      quote: t("langShort") === "FR" ? "Soumission simple et service efficace. Je recommande pour vitres et gouttières." : "Simple quote and efficient service. I recommend for windows and gutters.",
      stars: 5,
    },
  ];

  return (
    <section id="avis" className="bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <SectionTitle kicker={t("secRevK")} title={t("secRevT")} subtitle={t("secRevS")} />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-zinc-900 text-zinc-900" />
                ))}
              </div>
              <p className="mt-4 text-base italic leading-relaxed text-zinc-700">“{r.quote}”</p>
              <div className="mt-4 text-sm font-semibold text-zinc-900">{r.name}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <ValueCard icon={<Clock className="h-5 w-5" />} title={t("val1T")} desc={t("val1D")} />
          <ValueCard icon={<Shield className="h-5 w-5" />} title={t("val2T")} desc={t("val2D")} />
          <ValueCard icon={<Sparkles className="h-5 w-5" />} title={t("val3T")} desc={t("val3D")} />
        </div>
      </div>
    </section>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-900 text-white shrink-0">{icon}</div>
        <div>
          <div className="text-base font-semibold text-zinc-900">{title}</div>
          <div className="text-sm text-zinc-600 leading-relaxed">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function ServiceArea({ t }: { t: (k: keyof typeof i18n.fr) => string }) {
  return (
    <section id="territoire" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <SectionTitle kicker={t("secAreaK")} title={t("secAreaT")} subtitle={t("secAreaS")} />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm lg:col-span-2">
            <div className="text-base font-semibold text-zinc-900">{t("cities")}</div>
            <div className="mt-6 flex flex-wrap gap-2">
              {SERVICE_AREAS.map((c) => (
                <span key={c} className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm text-zinc-700">
                  <MapPin className="mr-2 h-4 w-4" />
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm text-zinc-600 leading-relaxed">{t("areaP")}</p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm">
            <div className="text-base font-semibold text-zinc-900">{t("convTip")}</div>
            <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{t("convTipText")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact({ t, onQuote }: { t: (k: keyof typeof i18n.fr) => string; onQuote: () => void }) {
  return (
    <section id="contact" className="bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("contactK")}</span>
            </div>
            <h3 className="mt-5 text-4xl font-semibold tracking-tight text-white">{t("contactT")}</h3>
            <p className="mt-4 text-lg leading-relaxed text-white/75">{t("contactP")}</p>

            <div className="mt-8 space-y-4">
              <a href={BRAND.phoneHref} className="flex items-center justify-between rounded-3xl bg-white/10 px-6 py-5 text-white ring-1 ring-white/15 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">{t("phone")}</div>
                    <div className="text-xl font-semibold">{BRAND.phoneDisplay}</div>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-white/40" />
              </a>

              <a href={BRAND.emailHref} className="flex items-center justify-between rounded-3xl bg-white/10 px-6 py-5 text-white ring-1 ring-white/15 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">{t("email")}</div>
                    <div className="text-xl font-semibold">{BRAND.email}</div>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-white/40" />
              </a>
            </div>

            <div className="mt-10 rounded-3xl bg-white/5 p-8 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white/60 uppercase tracking-wider">{t("hours")}</div>
              <div className="mt-2 text-base text-white">{t("hoursText")}</div>
              <div className="mt-6 text-sm font-semibold text-white/60 uppercase tracking-wider">{t("services")}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[t("serviceVitresT"), t("serviceGoutT"), t("servicePressT")].map((s) => (
                  <span key={s} className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/90 ring-1 ring-white/10">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="text-2xl font-semibold text-zinc-900">{t("formT")}</div>
            <p className="mt-2 text-base text-zinc-600">{t("formP")}</p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input label={t("name")} placeholder={t("name")} />
              <Input label={t("phoneLabel")} placeholder={BRAND.phoneDisplay} />
              <Input label={t("emailLabel")} placeholder="you@example.com" />
              <Input label={t("address")} placeholder={t("address")} />
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-zinc-900">{t("choose")}</div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  t("langShort") === "FR" ? "Lavage de vitres intérieures/extérieures" : "Interior/exterior windows",
                  t("langShort") === "FR" ? "Lavage de vitres extérieures seulement" : "Exterior windows only",
                  t("langShort") === "FR" ? "Vidange de gouttières" : "Gutter cleaning",
                  t("langShort") === "FR" ? "Lavage de revêtement" : "Siding wash",
                ].map((x) => (
                  <label key={x} className="flex items-start gap-3 rounded-2xl border border-zinc-200 p-4 cursor-pointer hover:border-zinc-400 transition-colors">
                    <input type="checkbox" className="mt-1.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                    <span className="text-sm text-zinc-700 leading-snug">{x}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold text-zinc-900">{t("desc")}</div>
              <textarea
                rows={4}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all"
                placeholder={t("langShort") === "FR" ? "Ex.: maison plain-pied, 12 fenêtres, besoin vitres + gouttières..." : "Example: single-storey, 12 windows, need windows + gutters..."}
              />
              <p className="mt-2 text-xs text-zinc-500 italic">{t("descHint")}</p>
            </div>

            <button
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-zinc-800 transition-colors"
              onClick={() => alert("Preview: connect this button to your email/CRM.")}
            >
              {t("send")} <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
              <div className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">{t("quick")}</div>
              <div className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {t("quickTextA")} <a href={BRAND.emailHref} className="font-semibold text-zinc-900 underline underline-offset-4">{BRAND.email}</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Input({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-zinc-900">{label}</div>
      <input
        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all"
        placeholder={placeholder}
      />
    </label>
  );
}

function QuoteModal({ open, onClose, t }: { open: boolean; onClose: () => void; t: (k: keyof typeof i18n.fr) => string }) {
  const [step, setStep] = useState(1);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-semibold text-zinc-900">{t("modalTitle")}</div>
                <div className="mt-1 text-sm text-zinc-500 font-medium">
                  {t("modalStep")} {step} {t("modalOf")} 2 — {t("langShort") === "FR" ? "rapide et simple" : "quick and simple"}.
                </div>
              </div>
              <button className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-colors" onClick={onClose}>
                <X className="h-6 w-6" />
              </button>
            </div>

            {step === 1 ? (
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input label={t("name")} placeholder={t("name")} />
                <Input label={t("phoneLabel")} placeholder={BRAND.phoneDisplay} />
                <Input label={t("emailLabel")} placeholder="you@example.com" />
                <Input label={t("address")} placeholder={t("address")} />
                <div className="sm:col-span-2">
                  <div className="text-sm font-semibold text-zinc-900">{t("choose")}</div>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[
                      t("langShort") === "FR" ? "Vitres int./ext." : "Interior/exterior windows",
                      t("langShort") === "FR" ? "Vitres ext. seulement" : "Exterior only",
                      t("langShort") === "FR" ? "Vidange gouttières" : "Gutter cleaning",
                      t("langShort") === "FR" ? "Lavage revêtement" : "Siding wash",
                    ].map((x) => (
                      <label key={x} className="flex items-start gap-3 rounded-2xl border border-zinc-200 p-4 cursor-pointer hover:border-zinc-400">
                        <input type="checkbox" className="mt-1.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                        <span className="text-sm text-zinc-700 leading-snug">{x}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <div className="text-sm font-semibold text-zinc-900">{t("desc")}</div>
                <textarea
                  rows={6}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white transition-all"
                  placeholder={t("langShort") === "FR" ? "Décrivez le travail (ex.: nombre de fenêtres, hauteur, accès, etc.)." : "Describe the job (e.g., window count, height, access, etc.)."}
                />
                <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
                  <div className="text-sm font-semibold text-zinc-900">{t("langShort") === "FR" ? "Pour aller plus vite" : "To go faster"}</div>
                  <p className="mt-2 text-sm text-zinc-600">
                    {t("langShort") === "FR" ? "Envoyez quelques photos à" : "Email a few photos to"} <span className="font-semibold">{BRAND.email}</span>.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50" onClick={() => (step === 1 ? onClose() : setStep(1))}>
                {step === 1 ? t("cancel") : t("back")}
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-8 py-4 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors" onClick={() => (step === 1 ? setStep(2) : alert("Preview: connect submission to email/CRM."))}>
                {step === 1 ? t("continue") : t("send")} <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function SpringCampaignContent({ locale }: { locale: "en" | "fr" }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  
  const t = (k: keyof typeof i18n.fr) => {
    const dict = i18n[locale] || i18n.fr;
    return (dict as any)[k] ?? k;
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* CSS Hack to hide the global header for this page only */}
      <style dangerouslySetInnerHTML={{ __html: `header { display: none !important; }` }} />
      
      <main>
        <Hero onQuote={() => setQuoteOpen(true)} t={t} />
        <Services t={t} />
        <Gallery t={t} />
        <Reviews t={t} />
        <ServiceArea t={t} />
        <Contact onQuote={() => setQuoteOpen(true)} t={t} />
      </main>

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} t={t} />
    </div>
  );
}
