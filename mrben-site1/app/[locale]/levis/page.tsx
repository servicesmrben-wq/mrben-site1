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
  const t = await getTranslations({ locale, namespace: 'home' });
  const canonical = `${BASE_URL}/${locale}/levis`;
  
  const title = locale === "fr" 
    ? "MrBen | Lavage de vitres et entretien extérieur à Lévis"
    : "MrBen | Window cleaning and exterior maintenance in Lévis";
    
  const description = locale === "fr"
    ? "Services professionnels de lavage de vitres, nettoyage de gouttières et revêtement à Lévis, Saint-Nicolas, Charny et Dosquet. Estimation gratuite."
    : "Professional window cleaning, gutter cleaning, and siding washing in Lévis, Saint-Nicolas, Charny, and Dosquet. Free estimate.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "fr-CA": `${BASE_URL}/fr/levis`,
        "en-CA": `${BASE_URL}/en/levis`,
        "x-default": `${BASE_URL}/fr/levis`,
      },
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const provider = getLocalBusinessProvider();
  
  // Custom strings for Lévis
  const sourceOfTruth = locale === "fr" 
    ? "MrBen est une entreprise locale de nettoyage de vitres résidentiel et commercial desservant Lévis et la Rive-Sud, incluant Saint-Nicolas, Charny et Dosquet."
    : "MrBen is a local residential and commercial window cleaning company serving Lévis and the South Shore, including Saint-Nicolas, Charny, and Dosquet.";

  const homeFaqItems = [0, 1, 2, 3, 4].map((index) => {
    let q = t(`faq.items.${index}.q`);
    let a = t(`faq.items.${index}.a`);
    
    // Replace Laurentides with Rive-Sud in FAQ
    if (index === 1) {
      q = locale === "fr" ? "Quelles régions desservez-vous?" : "What areas do you serve?";
      a = locale === "fr" 
        ? "Nous sommes une entreprise locale de nettoyage de vitres résidentiel et commercial desservant Lévis et la Rive-Sud, incluant Saint-Nicolas, Charny et Dosquet."
        : "We are a local residential and commercial window cleaning company serving Lévis and the South Shore, including Saint-Nicolas, Charny, and Dosquet.";
    }
    
    return { q, a };
  });

  const servedCities = ["Lévis", "Saint-Nicolas", "Charny", "Dosquet"].map((city) => ({
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
    serviceType: locale === "fr" ? "Lavage de vitres" : "Window cleaning",
    description: locale === "fr"
      ? "MrBen.ca offre des services professionnels de lavage de vitres, de nettoyage de gouttières et de nettoyage extérieur à Lévis et sur la Rive-Sud, notamment à Saint-Nicolas, Charny et Dosquet."
      : "MrBen.ca provides professional window cleaning, gutter cleaning, and exterior washing services across Lévis and the South Shore, including Saint-Nicolas, Charny, and Dosquet.",
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
