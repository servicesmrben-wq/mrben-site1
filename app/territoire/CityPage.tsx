import Image from "next/image";
import Link from "next/link";

import type { CityPage as CityPageData, Locale } from "./city-data";
import { getCityUrl } from "./seo";
import SeoFaq from "@/app/components/SeoFaq";
import { getTranslations } from "@/app/lib/translations";
import { toJsonLdString } from "@/app/lib/seo/jsonld";
import { getLocalBusinessProvider } from "@/app/lib/seo/schema";

const BRAND = {
  name: "MrBen.ca",
  phoneDisplay: "514-699-7145",
  phoneHref: "tel:+15146997145",
};

const DEFAULT_PRICE_LOW = 180;
const DEFAULT_PRICE_HIGH = 450;

function interpolate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  );
}

const LOCALE_LABELS: Record<
  Locale,
  { servicesLabel: string; cta: string; ctaReassurance: string; napLabel: string }
> = {
  fr: {
    servicesLabel: "Services offerts",
    cta: "Obtenir une estimation gratuite",
    ctaReassurance: "Réponse rapide • Aucune obligation",
    napLabel: "Coordonnées",
  },
  en: {
    servicesLabel: "Services offered",
    cta: "Get a free estimate",
    ctaReassurance: "Fast response • No obligation",
    napLabel: "Business info",
  },
};

const CITY_HERO_IMAGES: Record<string, string> = {
  lachute: "/nettoyage-vitres-maison-lachute-laurentides-mrben.jpg",
  "saint-jerome": "/nettoyage-vitres-maison-saint-jerome-laurentides-mrben.jpg",
  "saint-sauveur": "/nettoyage-vitres-maison-saint-sauveur-laurentides-mrben.jpg",
  mirabel: "/nettoyage-vitres-maison-mirabel-laurentides-mrben.jpg",
  blainville: "/nettoyage-vitres-maison-blainville-laurentides-mrben.jpg",
  laval: "/nettoyage-vitres-maison-laval-laurentides-mrben.jpg",
};

export function CityPage({ city, locale }: { city: CityPageData; locale: Locale }) {
  const content = city[locale];
  const labels = LOCALE_LABELS[locale];
  const t = getTranslations(locale);
  const citySourceOfTruth = t("territory.city.sourceOfTruth").replace("{city}", city.name);
  const priceLow = city.priceLow ?? DEFAULT_PRICE_LOW;
  const priceHigh = city.priceHigh ?? DEFAULT_PRICE_HIGH;
  const pageH1 = interpolate(t("territoryCityPage.h1"), { CITY: city.name });
  const servicesTitle = interpolate(t("territoryCityPage.servicesTitle"), { CITY: city.name });
  const buildingsTitle = t("territoryCityPage.buildingsTitle");
  const pricingTitle = t("territoryCityPage.pricingTitle");
  const whyTitle = interpolate(t("territoryCityPage.whyTitle"), { CITY: city.name });
  const faqTitle = t("territoryCityPage.faqTitle");
  const pricingSentence = interpolate(t("territoryCityPage.pricingSentence"), {
    CITY: city.name,
    LOW: String(priceLow),
    HIGH: String(priceHigh),
  });
  const servicesBullets = [
    t("territoryCityPage.servicesBullets.0"),
    t("territoryCityPage.servicesBullets.1"),
    t("territoryCityPage.servicesBullets.2"),
    t("territoryCityPage.servicesBullets.3"),
  ];
  const buildingsBullets = [
    t("territoryCityPage.buildingsBullets.0"),
    t("territoryCityPage.buildingsBullets.1"),
    t("territoryCityPage.buildingsBullets.2"),
    t("territoryCityPage.buildingsBullets.3"),
  ];
  const whyParagraph = interpolate(t("territoryCityPage.whyParagraph"), { CITY: city.name });
  const whyBullets = [
    t("territoryCityPage.whyBullets.0"),
    t("territoryCityPage.whyBullets.1"),
    t("territoryCityPage.whyBullets.2"),
    t("territoryCityPage.whyBullets.3"),
  ];
  const faqItems = [0, 1, 2, 3, 4].map((index) => ({
    q: t(`territoryCityPage.faq.${index}.q`),
    a: t(`territoryCityPage.faq.${index}.a`),
  }));
  const heroImage = CITY_HERO_IMAGES[city.slug];
  const heroImageAlt = t(`cityPages.heroImageAlt.${city.slug}`);
  const cityServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("jsonld.city.serviceNamePrefix") + city.name,
    description: t("jsonld.city.serviceDescriptionPrefix") + city.name,
    provider: getLocalBusinessProvider(),
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: locale === "fr" ? "Québec" : "Quebec",
      },
    },
    url: getCityUrl(city.slug),
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(cityServiceSchema) }}
      />
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {city.name}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            {pageH1}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600">
            {content.description}
          </p>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-700">
            {citySourceOfTruth}
          </p>
          {heroImage ? (
            <div className="relative mt-8 h-[260px] w-full overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-sm sm:h-[320px] lg:h-[380px]">
                <Image
                  src={heroImage}
                  alt={heroImageAlt}
                  fill
                  sizes="(max-width: 768px) 92vw, (max-width: 1280px) 900px, 1100px"
                  quality={90}
                  className="object-contain"
                  priority
                />
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              Lavage de vitres
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              Vidange de gouttières
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              Nettoyage de revêtement
            </span>
          </div>
          <div className="mt-8 flex flex-col items-start gap-1">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              {labels.cta}
            </Link>
            <span className="text-xs text-zinc-500">{labels.ctaReassurance}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-6 text-base leading-relaxed text-zinc-700">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <aside className="rounded-3xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {labels.servicesLabel}
            </div>
            <ul className="mt-4 space-y-2">
              <li>Lavage de vitres</li>
              <li>Vidange de gouttières</li>
              <li>Nettoyage de revêtement</li>
            </ul>
            <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {labels.napLabel}
            </div>
            <div className="mt-3">
              <div className="font-semibold text-zinc-900">{BRAND.name}</div>
              <div>{BRAND.phoneDisplay}</div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-10 px-4 pb-12">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{servicesTitle}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-zinc-700">
            {servicesBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{buildingsTitle}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-zinc-700">
            {buildingsBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{pricingTitle}</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700">{pricingSentence}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{whyTitle}</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700">{whyParagraph}</p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-relaxed text-zinc-700">
            {whyBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>

        <SeoFaq title={faqTitle} items={faqItems} />
      </section>

      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 text-center sm:items-start sm:text-left">
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                {labels.cta}
              </Link>
              <span className="text-xs text-zinc-500">{labels.ctaReassurance}</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-900">{BRAND.name}</span> • {BRAND.phoneDisplay}
        </div>
      </footer>
    </main>
  );
}
