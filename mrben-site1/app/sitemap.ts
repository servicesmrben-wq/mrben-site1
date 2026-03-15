import type { MetadataRoute } from "next";

import { CITY_PAGES } from "./territoire/city-data";
import { getSortedPostsData } from "./lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export default function sitemap(): MetadataRoute.Sitemap {
  const LAST_MAJOR_UPDATE = new Date("2024-12-11");

  const locales = ["en", "fr"];
  
  // Base routes for both Laurentides and Lévis
  const routes = [
    "", 
    "/services/lavage-de-vitres", 
    "/services/window-cleaning", 
    "/services/nettoyage-de-gouttieres",
    "/services/gutter-cleaning",
    "/services/nettoyage-de-revetement",
    "/services/siding-cleaning",
    "/blog",
    "/levis",
    "/levis/services/lavage-de-vitres",
    "/levis/services/window-cleaning",
    "/levis/services/nettoyage-de-gouttieres",
    "/levis/services/gutter-cleaning",
    "/levis/services/nettoyage-de-revetement",
    "/levis/services/siding-cleaning",
    "/levis/blog"
  ];

  const staticEntries = routes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: LAST_MAJOR_UPDATE,
    }))
  );

  const cityEntries = CITY_PAGES.flatMap((city) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/territoire/${city.slug}`,
      lastModified: LAST_MAJOR_UPDATE,
    }))
  );

  const blogEntries = locales.flatMap((locale) => {
    const posts = getSortedPostsData(locale);
    const standardBlogEntries = posts.map((post) => ({
      url: `${BASE_URL}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
    }));
    const levisBlogEntries = posts.map((post) => ({
      url: `${BASE_URL}/${locale}/levis/blog/${post.slug}`,
      lastModified: new Date(post.date),
    }));
    return [...standardBlogEntries, ...levisBlogEntries];
  });

  return [...staticEntries, ...cityEntries, ...blogEntries];
}
