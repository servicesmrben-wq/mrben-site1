import type { MetadataRoute } from "next";

import { CITY_PAGES } from "./territoire/city-data";
import { getCityUrl } from "./territoire/seo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const cityEntries = CITY_PAGES.flatMap((city) => [
    {
      url: getCityUrl(city.slug, "fr"),
      lastModified: now,
    },
    {
      url: getCityUrl(city.slug, "en"),
      lastModified: now,
    },
  ]);

  return [
    {
      url: BASE_URL,
      lastModified: now,
    },
    ...cityEntries,
  ];
}
