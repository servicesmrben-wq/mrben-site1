import type { MetadataRoute } from "next";

import { CITY_PAGES } from "./territoire/city-data";
import { getSortedPostsData } from "./lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrben.ca";

export default function sitemap(): MetadataRoute.Sitemap {
  // Use a recent date for the latest updates
  const LAST_MAJOR_UPDATE = new Date("2026-03-15");

  const locales = ["en", "fr"];
  
  // Define routes by locale to avoid redirects
  const routesByLocale: Record<string, string[]> = {
    fr: [
      "",
      "/lavage-de-vitre",
      "/nettoyage-de-gouttieres",
      "/nettoyage-de-revetement",
      "/blog",
      "/estimator",
      "/levis",
      "/levis/lavage-de-vitre",
      "/levis/nettoyage-de-gouttieres",
      "/levis/nettoyage-de-revetement",
      "/levis/blog"
    ],
    en: [
      "",
      "/window-cleaning",
      "/gutter-cleaning",
      "/siding-cleaning",
      "/blog",
      "/estimator",
      "/levis",
      "/levis/window-cleaning",
      "/levis/gutter-cleaning",
      "/levis/siding-cleaning",
      "/levis/blog"
    ]
  };

  const staticEntries = locales.flatMap((locale) => {
    const localePath = locale === 'fr' ? '' : '/en';
    return routesByLocale[locale].map((route) => {
      // Home pages and main regional pages get higher priority
      let priority = 0.8;
      if (route === "" || route === "/levis") priority = 1.0;
      if (route === "/lavage-de-vitre" || route === "/window-cleaning") priority = 0.9;
      if (route === "/nettoyage-de-gouttieres" || route === "/gutter-cleaning") priority = 0.9;
      if (route === "/nettoyage-de-revetement" || route === "/siding-cleaning") priority = 0.9;
      
      return {
        url: `${BASE_URL}${localePath}${route}`,
        lastModified: LAST_MAJOR_UPDATE,
        changeFrequency: (route === "" || route === "/levis") ? "weekly" : "monthly" as any,
        priority,
      };
    });
  });

  const cityEntries = CITY_PAGES.flatMap((city) =>
    locales.map((locale) => {
      const prefix = locale === 'en' ? 'window-cleaning' : 'lavage-de-vitre';
      const localePath = locale === 'fr' ? '' : '/en';
      return {
        url: `${BASE_URL}${localePath}/${prefix}-${city.slug}`,
        lastModified: LAST_MAJOR_UPDATE,
        changeFrequency: "monthly" as any,
        priority: 0.7,
      };
    })
  );

  const blogEntries = locales.flatMap((locale) => {
    const posts = getSortedPostsData(locale);
    const localePath = locale === 'fr' ? '' : '/en';
    
    const standardBlogEntries = posts.map((post) => ({
      url: `${BASE_URL}${localePath}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as any,
      priority: 0.6,
    }));
    
    const levisBlogEntries = posts.map((post) => ({
      url: `${BASE_URL}${localePath}/levis/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as any,
      priority: 0.6,
    }));
    
    return [...standardBlogEntries, ...levisBlogEntries];
  });

  return [...staticEntries, ...cityEntries, ...blogEntries];
}
