import type { Metadata } from "next";

import SeoFaq from "../components/SeoFaq";
import MrBenRedesignPreview from "../components/MrBenRedesignPreview";
import { toJsonLdString } from "../lib/seo/jsonld";
import { getLocalBusinessProvider } from "../lib/seo/schema";
import { getTranslations } from 'next-intl/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const url = `${BASE_URL}/${locale}`;

  return {
    alternates: {
      canonical: url,
      languages: {
        "fr-CA": `${BASE_URL}/fr`,
        "en-CA": `${BASE_URL}/en`,
        "x-default": `${BASE_URL}/fr`,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const provider = getLocalBusinessProvider();
  const homeSourceOfTruth = t("sourceOfTruth"); // Renamed key
  const homeFaqItems = [0, 1, 2, 3, 4].map((index) => ({
    q: t(`faq.items.${index}.q`), // Renamed key
    a: t(`faq.items.${index}.a`), // Renamed key
  }));

  const servedCities = ["Lachute", "Saint-Jérôme", "Mirabel", "Blainville"].map((city) => ({
    "@type": "City",
    name: city,
    address: {
      "@type": "PostalAddress",
      addressRegion: "QC",
      addressCountry: "CA",
    },
  }));

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    ...provider,
    areaServed: servedCities,
    serviceType: locale === "fr" ? "Lavage de vitres" : "Window cleaning",
    description: t("jsonld.localBusiness.description"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(localBusinessJsonLd) }}
      />
      <MrBenRedesignPreview sourceOfTruth={homeSourceOfTruth} />
      <SeoFaq title={t("faq.title")} items={homeFaqItems} />
    </>
  );
}
