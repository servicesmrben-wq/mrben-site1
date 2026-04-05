import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CityPage } from "../territoire/CityPage";
import { CITY_SLUGS, getCityBySlug, type Locale } from "../../territoire/city-data";
import { buildCityMetadata } from "../territoire/seo";
import { getLocale } from "next-intl/server";
import { locales } from "@/navigation";

type Params = { locale: string; serviceCity: string };

type PageProps = {
  params: Promise<Params>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    CITY_SLUGS.map((slug) => {
      const prefix = locale === 'en' ? 'window-cleaning' : 'lavage-de-vitre';
      return { locale, serviceCity: `${prefix}-${slug}` };
    })
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, serviceCity } = await params;
  const currentLocale = locale as Locale;
  const prefix = currentLocale === 'en' ? 'window-cleaning-' : 'lavage-de-vitre-';
  
  if (!serviceCity.startsWith(prefix)) {
    // If it starts with the wrong prefix, we'll let the Page component handle the redirect
    // but for metadata we should return something or just notFound if it's completely wrong.
    const otherPrefix = currentLocale === 'en' ? 'lavage-de-vitre-' : 'window-cleaning-';
    if (serviceCity.startsWith(otherPrefix)) {
      const slug = serviceCity.slice(otherPrefix.length);
      const city = getCityBySlug(slug);
      if (city) return buildCityMetadata(city, currentLocale);
    }
    notFound();
  }
  
  const slug = serviceCity.slice(prefix.length);
  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  return buildCityMetadata(city, currentLocale);
}

export default async function Page({ params }: PageProps) {
  const { locale, serviceCity } = await params;
  const currentLocale = locale as Locale;
  const prefix = currentLocale === 'en' ? 'window-cleaning-' : 'lavage-de-vitre-';
  const otherPrefix = currentLocale === 'en' ? 'lavage-de-vitre-' : 'window-cleaning-';

  // Handle cross-locale redirects
  // e.g., if someone is at /en/lavage-de-vitres-lachute, redirect to /en/window-cleaning-lachute
  if (serviceCity.startsWith(otherPrefix)) {
    const slug = serviceCity.slice(otherPrefix.length);
    if (CITY_SLUGS.includes(slug)) {
      redirect(`/${currentLocale}/${prefix}${slug}`);
    }
  }
  
  if (!serviceCity.startsWith(prefix)) {
    notFound();
  }
  
  let slug = serviceCity.slice(prefix.length);

  if (slug === "st-sauveur") {
    redirect(`/${currentLocale}/${prefix}saint-sauveur`);
  }

  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  return <CityPage city={city} />;
}
