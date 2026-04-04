import type { Metadata } from "next";

import type { CityPage, Locale } from "../../territoire/city-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export function getCityUrl(slug: string, locale: Locale) {
  const prefix = locale === 'en' ? 'window-cleaning' : 'lavage-de-vitres';
  return `${BASE_URL}/${locale}/${prefix}-${slug}`;
}

export function buildCityMetadata(city: CityPage, locale: Locale): Metadata {
  const content = city[locale];
  const canonical = getCityUrl(city.slug, locale);

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical,
      languages: {
        "fr-CA": getCityUrl(city.slug, "fr"),
        "en-CA": getCityUrl(city.slug, "en"),
      },
    },
  };
}
