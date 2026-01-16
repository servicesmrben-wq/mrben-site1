import type { Metadata } from "next";

import type { CityPage, Locale } from "./city-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export function getCityUrl(slug: string) {
  return `${BASE_URL}/territoire/${slug}`;
}

export function buildCityMetadata(city: CityPage, locale: Locale): Metadata {
  const content = city[locale];
  const canonical = getCityUrl(city.slug);

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical,
      languages: {
        "fr-CA": getCityUrl(city.slug),
        "en-CA": getCityUrl(city.slug),
      },
    },
  };
}
