import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CityPage } from "../CityPage";
import { CITY_SLUGS, getCityBySlug, type Locale } from "../../../territoire/city-data";
import { buildCityMetadata } from "../seo";
import { getLocale } from "next-intl/server";
import { locales } from "@/navigation";

type Params = { locale: string; slug: string };

type PageProps = {
  params: Promise<Params>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    CITY_SLUGS.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  const locale = (await getLocale()) as Locale;
  return buildCityMetadata(city, locale);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "st-sauveur") {
    const locale = await getLocale();
    redirect(`/${locale}/territoire/saint-sauveur`);
  }

  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  return <CityPage city={city} />;
}
