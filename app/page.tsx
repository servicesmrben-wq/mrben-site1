import type { Metadata } from "next";

import MrBenRedesignPreview from "./MrBenRedesignPreview";
import { getLocaleFromRequest } from "./lib/locale";
import { toJsonLdString } from "./lib/seo/jsonld";
import { getLocalBusinessProvider } from "./lib/seo/schema";
import { getTranslations } from "./lib/translations";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export const metadata: Metadata = {
  alternates: {
    canonical: BASE_URL,
    languages: {
      "fr-CA": BASE_URL,
      "en-CA": BASE_URL,
      "x-default": BASE_URL,
    },
  },
};

export default async function Page() {
  const locale = await getLocaleFromRequest();
  const t = getTranslations(locale);
  const provider = getLocalBusinessProvider();

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    ...provider,
    image: "https://mrben.ca/hero.jpg",
    areaServed: [
      "Laurentides, Québec, Canada",
      "Lachute, Québec, Canada",
      "Saint-Jérôme, Québec, Canada",
      "Mirabel, Québec, Canada",
    ],
    description: t("jsonld.localBusiness.description"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(localBusinessJsonLd) }}
      />
      <MrBenRedesignPreview />
    </>
  );
}
