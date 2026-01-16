import type { Metadata } from "next";

import type { CityPage, Locale } from "./city-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export function getCityUrl(slug: string, locale: Locale) {
  if (locale === "en") {
    return `${BASE_URL}/en/territoire/${slug}`;
  }
  return `${BASE_URL}/territoire/${slug}`;
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
