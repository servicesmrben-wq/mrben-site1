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
      const prefix = locale === 'en' ? 'window-cleaning' : 'lavage-de-vitres';
      return { locale, serviceCity: `${prefix}-${slug}` };
    })
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serviceCity } = await params;
  const locale = (await getLocale()) as Locale;
  const prefix = locale === 'en' ? 'window-cleaning-' : 'lavage-de-vitres-';
  
  if (!serviceCity.startsWith(prefix)) {
    notFound();
  }
  
  const slug = serviceCity.slice(prefix.length);
  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  return buildCityMetadata(city, locale);
}

export default async function Page({ params }: PageProps) {
  const { serviceCity } = await params;
  const locale = (await getLocale()) as Locale;
  const prefix = locale === 'en' ? 'window-cleaning-' : 'lavage-de-vitres-';
  
  if (!serviceCity.startsWith(prefix)) {
    notFound();
  }
  
  let slug = serviceCity.slice(prefix.length);

  if (slug === "st-sauveur") {
    redirect(`/${locale}/${prefix}saint-sauveur`);
  }

  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  return <CityPage city={city} />;
}
