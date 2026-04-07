"use client";

import Image from "next/image";
import Link from "next/link";

import type { CityPage as CityPageData, Locale } from "../../territoire/city-data";
import { getCityUrl } from "./seo";
import SeoFaq from "@/app/components/SeoFaq";
import { toJsonLdString } from "@/app/lib/seo/jsonld";
import { getLocalBusinessProvider, getBreadcrumbSchema } from "@/app/lib/seo/schema";
import { useLocale, useTranslations } from "next-intl";

const BRAND = {
  name: "MrBen.ca",
  phoneDisplay: "514-699-7145",
  phoneHref: "tel:+15146997145",
};

const DEFAULT_PRICE_LOW = 180;
const DEFAULT_PRICE_HIGH = 450;

const CITY_HERO_IMAGES: Record<string, string> = {
  lachute: "/nettoyage-vitres-maison-lachute-laurentides-mrben.jpg",
  "saint-jerome": "/nettoyage-vitres-maison-saint-jerome-laurentides-mrben.jpg",
  "saint-sauveur": "/nettoyage-vitres-maison-saint-sauveur-laurentides-mrben.jpg",
  mirabel: "/nettoyage-vitres-maison-mirabel-laurentides-mrben.jpg",
  blainville: "/nettoyage-vitres-maison-blainville-laurentides-mrben.jpg",
  laval: "/nettoyage-vitres-maison-laval-laurentides-mrben.jpg",
};

const LEVIS_SLUGS = ["levis", "saint-nicolas", "charny", "dosquet"];

export function CityPage({ city }: { city: CityPageData }) {
  const locale = useLocale() as Locale;
  const content = city[locale];
  const t = useTranslations('territoryCityPage');
  const tCommon = useTranslations('territory');
  
  const isLevisCity = LEVIS_SLUGS.includes(city.slug);
  
  const BRAND = {
    name: "MrBen.ca",
    phoneDisplay: isLevisCity ? "418-741-2217" : "514-699-7145",
    phoneHref: isLevisCity ? "tel:+14187412217" : "tel:+15146997145",
  };

  const citySourceOfTruth = isLevisCity 
    ? tCommon("city.sourceOfTruth", { city: city.name }).replace("dans les Laurentides", "dans la région de Lotbinière").replace("in the Laurentians", "in the Lotbinière region")
    : tCommon("city.sourceOfTruth", { city: city.name });
  const priceLow = city.priceLow ?? DEFAULT_PRICE_LOW;
  const priceHigh = city.priceHigh ?? DEFAULT_PRICE_HIGH;
  const pageH1 = t("h1", { CITY: city.name });
  const servicesTitle = t("servicesTitle", { CITY: city.name });
  const buildingsTitle = t("buildingsTitle");
  const pricingTitle = t("pricingTitle");
  const whyTitle = t("whyTitle", { CITY: city.name });
  const faqTitle = t("faqTitle");
  const pricingSentence = t("pricingSentence", {
    CITY: city.name,
    LOW: String(priceLow),
    HIGH: String(priceHigh),
  });
  const servicesBullets = [
    t("servicesBullets.0"),
    t("servicesBullets.1"),
    t("servicesBullets.2"),
    t("servicesBullets.3"),
  ];
  const buildingsBullets = [
    t("buildingsBullets.0"),
    t("buildingsBullets.1"),
    t("buildingsBullets.2"),
    t("buildingsBullets.3"),
  ];
  const whyParagraph = t("whyParagraph", { CITY: city.name });
  const whyBullets = [
    t("whyBullets.0"),
    t("whyBullets.1"),
    t("whyBullets.2"),
    t("whyBullets.3"),
  ];
  const faqItems = [0, 1, 2, 3, 4].map((index) => ({
    q: t(`faq.${index}.q`),
    a: t(`faq.${index}.a`),
  }));
  const heroImage = CITY_HERO_IMAGES[city.slug];
  const heroImageAlt = t(`heroImageAlt.${city.slug}`);
  const cityUrl = getCityUrl(city.slug, locale);
  
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
    url: cityUrl,
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: locale === "fr" ? "Accueil" : "Home", item: locale === "fr" ? "https://mrben.ca" : "https://mrben.ca/en" },
    { name: city.name, item: cityUrl },
  ]);

  const contactHref = isLevisCity ? `/${locale}/levis#contact` : "/#contact";

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(cityServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(breadcrumbSchema) }}
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
            <div className="relative mt-8 w-full max-w-lg aspect-[1.90/1] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-sm">
              <Image
                src={heroImage}
                alt={heroImageAlt}
                fill
                sizes="(max-width: 640px) 92vw, 512px"
                quality={90}
                className="object-cover object-center"
                priority
              />
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              {t("services.windowCleaning")}
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              {t("services.gutterCleaning")}
            </span>
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
              {t("services.sidingCleaning")}
            </span>
          </div>
          <div className="mt-8 flex flex-col items-start gap-1">
            <Link
              href={contactHref}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              {t("cta")}
            </Link>
            <span className="text-xs text-zinc-500">{t("ctaReassurance")}</span>
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
              {t("servicesLabel")}
            </div>
            <ul className="mt-4 space-y-2">
              <li>{t("services.windowCleaning")}</li>
              <li>{t("services.gutterCleaning")}</li>
              <li>{t("services.sidingCleaning")}</li>
            </ul>
            <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {t("napLabel")}
            </div>
            <div className="mt-3">
              <div className="font-semibold text-zinc-900">{BRAND.name}</div>
              <a href={BRAND.phoneHref} className="hover:underline">{BRAND.phoneDisplay}</a>
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
                href={contactHref}
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                {t("cta")}
              </Link>
              <span className="text-xs text-zinc-500">{t("ctaReassurance")}</span>
            </div>
          </div>
        </div>
      </section>


    </main>
  );
}
