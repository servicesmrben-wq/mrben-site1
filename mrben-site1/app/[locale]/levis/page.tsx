import type { Metadata } from "next";

import SeoFaq from "../../components/SeoFaq";
import LevisRedesignPreview from "../../components/LevisRedesignPreview";
import { toJsonLdString } from "../../lib/seo/jsonld";
import { getLocalBusinessProvider } from "../../lib/seo/schema";
import { getTranslations } from 'next-intl/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  const tLevis = await getTranslations({ locale, namespace: 'levis' });
  const localePath = locale === 'fr' ? '' : '/en';
  const canonical = `${BASE_URL}${localePath}/levis`;
  
  return {
    title: tLevis('metaTitle'),
    description: tLevis('metaDescription'),
    alternates: {
      canonical,
      languages: {
        "fr-CA": `${BASE_URL}/levis`,
        "en-CA": `${BASE_URL}/en/levis`,
        "x-default": `${BASE_URL}/levis`,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tLevis = await getTranslations({ locale, namespace: 'levis' });
  const provider = getLocalBusinessProvider();
  
  const sourceOfTruth = tLevis('sourceOfTruth');

  const homeFaqItems = [0, 1, 2, 3, 4].map((index) => {
    const qKey = `faq.items.${index}.q`;
    const aKey = `faq.items.${index}.a`;
    let q = t(qKey);
    let a = t(aKey);
    
    // Replace regions in FAQ
    if (index === 1) {
      q = tLevis('faqQuestion');
      a = tLevis('faqAnswer');
    }

    // Safety fallback
    if (q === qKey) q = "";
    if (a === aKey) a = "";
    
    return { q, a };
  }).filter(item => item.q !== "");

  const servedCities = ["Lévis", "Saint-Nicolas", "Charny", "Dosquet", "Saint-Apollinaire", "Laurier-Station", "Lotbinière"].map((city) => ({
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
    name: "MrBen",
    url: `${BASE_URL}/${locale}/levis`,
    image: "https://mrben.ca/hero.jpg",
    areaServed: servedCities,
    serviceType: tLevis('serviceType'),
    description: tLevis('jsonldDescription'),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lévis",
      addressRegion: "QC",
      addressCountry: "CA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 46.8033,
      longitude: -71.1772,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(localBusinessJsonLd) }}
      />
      <LevisRedesignPreview 
        sourceOfTruth={sourceOfTruth} 
        phoneNumber="418-741-2217"
        phoneHref="tel:+14187412217"
      />
      <SeoFaq title={t("faq.title")} items={homeFaqItems} />
    </>
  );
}
