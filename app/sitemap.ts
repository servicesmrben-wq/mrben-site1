import type { MetadataRoute } from "next";

import { CITY_PAGES } from "./territoire/city-data";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const locales = ["en", "fr"];
  const routes = ["", "/services/lavage-de-vitres", "/services/window-cleaning", "/blog"];

  const staticEntries = routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: now,
    }))
  );

  const cityEntries = CITY_PAGES.flatMap((city) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/territoire/${city.slug}`,
      lastModified: now,
    }))
  );

  return [...staticEntries, ...cityEntries];
}
